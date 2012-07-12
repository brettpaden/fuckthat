class FuckError < StandardError
  attr_accessor :status
  
  def initialize(status)
    @status = status
  end
end

class FucksController < ApplicationController

  # GET /fucks
  # GET /fucks.json
  def index
    # Form conditions
    conditions = {} 
    if params[:fucker_id] then
      # Support fucker_id
      conditions[:fucker_id] = params[:fucker_id] 
    elsif params[:fucker] then
      # Support 'fucker' lookup
      conditions['fuckers.name'] = params[:fucker]
    elsif params[:name] then
      # Support 'fucker' lookup, by name
      conditions['fuckers.name'] = params[:name]
    end
    if params[:that_id] then
      # Support that_id
      conditions[:that_id] = params[:that_id]
    elsif params[:that] then
      # Support 'that' lookup
      conditions['thats.url'] = params[:that]
    elsif params[:url] then
      # Support 'that' lookup, by url
      conditions['thats.url'] = params[:url]
    end
    
    # Collect, with exception protection
    # Note that this is "lazy" collection, the query itself will be performed upon render
    begin
      @fucks = Fuck.
        joins([:fucker, :that]).
        where(conditions).
        order(params[:sort]).
        offset(params[:start]).
        limit(params[:limit])
      if params[:count] then @fuck_count = @fucks.count end

      # This is eager loading, and apparently will be deprecated in Rails 3.2...?
#      @fucks = Fuck.all(
#        :include => ['fucker', 'that'],
#        :conditions => conditions,
#        :order => params[:sort] || nil,
#        :offset => params[:start] || nil, 
#        :limit => params[:limit] || nil)
    rescue => err
      $log.warn(err)
    end
    
    # Respond JSON only, with exception protection    
    begin
      respond_to do |format|
        if err 
          # Result of eager loading
          format.json { render json: err, status: :internal_server_error }
        else
          if @fuck_count
            format.json {render json: @fuck_count }
          else
            format.json {render json: @fucks }
          end
        end
      end
    rescue => err
      # Result of lazy loading
      $log.warn(err)    
      respond_to do |format|
        format.json { render json: err, status: :internal_server_error }
      end
    end
  end

  # GET /fucks/1
  # GET /fucks/1.json
  def show
    begin
      @fuck = Fuck.find(params[:id])
      respond_to do |format|
        format.json { render json: @fuck }
      end
    rescue => err
      $log.warn(err)
      respond_to do |format|
        format.json { render json: err, status: :internal_server_error }
      end
    end
  end

  # Extract true picture url from passed in attachment info
  def extract_pic(pic)
    # Extract from within URL as needed
    pic =
      ((uri = URI(pic)) &&
       (query = CGI.parse(uri.query)) &&
       ((query['src'] && query['src'][0]) ||
        (query['url'] && query['url'][0]))) ||
      pic

    # Substitute our own server's proxy for facebook-hosted content, which facebook in their
    # infinite stupidity will not allow us to post in a stream
    pic.sub!(/http:\/\/(.+).fbcdn.net/, request.protocol+request.host_with_port+'/fb_photo/\1.fbcdn.net')
    pic
  end

  # Extract facebook id
  def extract_fbid(url)
    if (uri = URI(url))
      query = uri.query
      if query
        query = CGI.parse(query)
        if query
          fbid = (query['fbid'] && query['fbid'][0]) || (query['story_fbid'] && query['story_fbid'][0])
          id = query['id'] && query['id'][0]
          return fbid, id
        end
      end
      id = url.match /http:\/\/www.facebook.com\/(.*)\/posts\/([0-9]*)/
      if id && id[2]
        return nil, id[2] 
      end 
    end
    return nil, nil
  end

  # Extract link info from URL
  def extract_link_info(url)
    link = url.scan /<[a|A]\b[^>]*>(.*?)<\/[a|A]>/
    (link[0] && link[0][0]) || url
  end

  # Extract link info from facebook object and parameters
  def extract_link(fb_obj, params)
    (params['comment_body'] || (params['body'] && params['body'].index('was bummed out by') != nil)) ?
      params[:url] :
      (fb_obj && fb_obj['link']) || params['link'] || extract_link_info(params[:url])
  end

  # Connect to facebook through RestGraph, returning RestGraph object and me object
  def connect_facebook
    # Must have a valid access token
    if !session['FB-Token']
      $log.warn('Could not connect to facebook, no access token')
      return nil, nil
    end
    begin
      rg = RestGraph.new(:access_token => session['FB-Token'],
        :graph_server => FuckersController::FBGraphServer,
        :app_id       => FuckersController::FBAppID,
        :secret       => FuckersController::FBAppSecret)
      me = rg.get('me')
      return rg, me
    rescue => err
      # Unable to get me, this is not a valid acces token
      $log.warn('Could not connect to facebook, unable to obtain facebook me: '+err.message)
      return nil, nil
    end
  end

  # Extract facebook object from URL
  def extract_fb_info(rg, me, url)
    # Get facebook object, if any
    fbid, id = extract_fbid(url)
    if fbid && id
      rg.get("#{id}_#{fbid}")
    elsif id
      rg.get(id)
    else
      nil 
    end
  end

  # Describe a facebook object
  def describe_fb_obj(fb_obj, params)
    author = (fb_obj && fb_obj['from']['name']) || params['author']
    type = (params['body'].index('was bummed out by') == nil && fb_obj && fb_obj['type']) ||
      (params['link'] && 'link') || 'post'
    msg = (fb_obj && fb_obj['message']) || params['body']
    desc = (fb_obj && fb_obj['name']) || ''
    if params['comment_body'] && params['comment_author']
      return "#{params['comment_author']}'s comment on #{author}'s #{type}:",
      "#{params['comment_body']}",
      "(#{author}'s post: \"#{msg}\")"
    else
      return "#{author}'s #{type}:",
      "#{msg}",
      desc
    end
  end

  # Extract info for a that from facebook object and passed parameters
  def extract_that_info(fb_obj, params)
    # Return link, title, caption, descriptionm, picture based on facebook object or passed parameters
    link = extract_link(fb_obj, params)
    title, caption, description = describe_fb_obj(fb_obj, params)
    picture = (fb_obj && fb_obj['picture']) ||
      (params[:attachments] && params[:attachments][0])
    picture = extract_pic(picture) unless !picture # Extract actual URL from facebook URL if available
    return link, title, caption, description, picture
  end

  # Clean-up facebook post text
  def fb_sanitize(str)
    str.gsub! /<\/?[^>]*>/, "" # Purge HTML tags
    str = str[0,997]+'...' if str.length>1000
    str
  end

  # Clean up facebook links to remove spurious query fields
  def sanitize_link(link)
#    retain_params = ['story_fbid', 'id', 'comment_id'] # Only retain these parameters
    if (uri = URI(link)) && (query = uri.query) && (query = CGI.parse(query))
      uri.query = query.sort.map{|k,v| "#{CGI.escape(k)}=#{CGI.escape(v[0])}"}.join("&")
      uri.to_s
    else
      link
    end    
  end
  
  # Post a fuck action to user's facebook newsfeed
  def fb_post(rg, me, fb_obj, link, title, caption, desc, picture)
    did_retry = false
    caption = fb_sanitize(caption)
    title = fb_sanitize(title)
    desc = fb_sanitize(desc)
    begin
      rg.post('me/feed', :message => "#{me['first_name']} was bummed out by...",
        :link => link,
        :name => title,
        :caption => caption,
        :description => desc,
        :picture => picture,
      )
    rescue => err
      # If we have a picture, try again without the picture
      if picture && !did_retry
        picture = ''
        did_retry = true
        $log.warn('Could not post with picture to facebook newsfeed, retrying without picture: '+err.message)
        retry
      end
      $log.warn('Could not post to facebook newsfeed: '+err.message)
    end
  end

  # Helper fuck-creation routine
  def create_fuck
    status = :internal_server_error
    begin
      # Must have an instance id
      params[:instance_id] ||
        (raise FuckError.new(:forbidden), "Attempt to create fuck with no instance ID")

      # Session fucker must match the fuck's fucker
      session[:fucker] || (raise FuckError.new(:forbidden), "No current fucker")
      (session[:fucker].id == @fuck.fucker_id) || (raise FuckError.new(:forbidden), "Fucker not authorized")

      # Ensure a fuck for this url and fucker does not already exist
      Fuck.first(:conditions => {:fucker_id => @fuck.fucker_id, :that_id => @fuck.that_id}) &&
        (raise FuckError.new(:forbidden), "Fucker has already fucked that.")

      # Increment the 'that's fuck count
      @fuck.that.fuck_count += 1

      @fuck.transaction do
        begin
          # Note, associated 'that' is automatically saved through the :autosave property of Fuck.that
          @fuck.save!

          # Create new event for this new fuck
          @event = Event.new(
            :fuck_id => @fuck.id,
            :fucker_id => @fuck.fucker_id,
            :that_id => @fuck.that_id,
            :withdraw => false,
            :fuck_created_at => nil,
            :instance_id => params[:instance_id].to_s
          )
          @event.save!
        rescue => err
          raise FuckError.new(:unprocessable_entity), err
        end
      end

      # Render as JSON
      respond_to do |format|
        format.json { render json: @fuck, status: :created, location: @fuck }
      end
    rescue FuckError => e
      $log.warn("Create fuck failed: #{e.message}")
      respond_to do |format|
        format.json { render json: e.message, status: e.status }
      end
    end
  end

  # POST /fucks
  # POST /fucks.json
  def create
    @fuck = Fuck.new(params[:fuck])
    create_fuck 
  end

  # PUT /fucks/1
  # PUT /fucks/1.json
  def update
#    @fuck = Fuck.find(params[:id])
    
    # Error, can't update a fuck, at least for now...
    err = "Attempt to update fuck #{params[:id]} failed"
    $log.warn(err)
    respond_to do |format|
      format.json { render json: err, status: :forbidden }
    end
    
    # Original generated code    
#    respond_to do |format|
#      if @fuck.update_attributes(params[:fuck])
#        format.html { redirect_to @fuck, notice: 'Fuck was successfully updated.' }
#        format.json { head :no_content }
#      else
#        format.html { render action: "edit" }
#        format.json { render json: @fuck.errors, status: :unprocessable_entity }
#      end
#    end
  end

  # Helper fuck deletion routine
  def delete_fuck
    status = :internal_server_error
    begin
      # Must have an instance id
      params[:instance_id] || 
        (raise FuckError.new(:forbidden), "Attempt to delete fuck with no instance ID")

      # Session fucker must match the fuck's fucker
      session[:fucker] || (raise FuckError.new(:forbidden), "No current fucker")
      (session[:fucker].id == @fuck.fucker_id) || (raise FuckError.new(:forbidden), "Fucker not authorized")
      
      # Decrement the 'that's' fuck count
      @fuck.that.fuck_count -= 1 
      
      # Delete, save that, create event
      Fuck.transaction do
        begin
          @fuck.that.save!
          @fuck.destroy
          
          # Create new event for the fuck withdrawal
          @event = Event.new(
            :fuck_id => @fuck.id, 
            :fucker_id => @fuck.fucker_id,
            :that_id => @fuck.that_id,
            :withdraw => true,
            :fuck_created_at => @fuck.created_at,
            :instance_id => params[:instance_id].to_s
          )
          @event.save!
        rescue => err
          raise FuckError.new(:unprocessable_entity), err
        end
      end
      
      # Render JSON
      respond_to do |format|
        format.json { head :no_content }
      end
    rescue FuckError => e
      $log.warn(e.message)
      respond_to do |format|
        format.json { render json: e.message, status: e.status }
      end
    end      
  end
  
  # DELETE /fucks/1
  # DELETE /fucks/1.json
  def destroy
    @fuck = Fuck.find_by_id(params[:id])
    if @fuck
      delete_fuck
    else
      err = "Fucker hasn't fucked that."
      $log.warn(err)
      respond_to do |format|
        format.json {render json: err, status: :forbidden }
      end
    end
  end
  
  # POST /fucks/fuckthat
  # A fuckthat from the web, with url and facebook id passed in
  def fuckthat
    status = :internal_server_error
    begin
      # Make sure we have a current fucker and a url
      session[:fucker] || (raise FuckError.new(:forbidden), "No current fucker")
      (params[:url] && params[:url].length > 0) || (raise FuckError.new(:forbidden), "No URL")

      # Attempt to make connection with facebook graph API
      rg, me = connect_facebook

      # Extract facebook info
      fb_obj = rg && extract_fb_info(rg, me, params[:url])
      # Extract info as necessary
      link, title, caption, desc, picture = extract_that_info(fb_obj, params)

      # Clean up facebook links
      link = sanitize_link(link)
      That.transaction do
        begin
          # Does the that already exist?
          that = That.first(:conditions => {:url => link})
          if !that
            # No, create it
            that = That.new({:url => link, :title => desc, :picture => picture})
            that.dont_aggregate = (URI(link).host == 'www.facebook.com') # Don't aggregate native fb content 
            that.save!
          end

          # Create the fuck
          @fuck = Fuck.new({:fucker_id => session[:fucker].id, :that_id => that.id})
          create_fuck

          # Post to facebook newsfeed
          fb_post rg, me, fb_obj, link, title, caption, desc, picture unless (!rg || !me)
          return # create_fuck renders on its own
        rescue => err
          raise FuckError.new(:unprocessable_entity), err
        end
      end
    rescue FuckError => e
      $log.warn(e.message)
      respond_to do |format|
        format.json { render json: e.message, status: e.status }
      end
    end
  end

  # DELETE /fucks/fuckthat
  # Delete a fuck from the web, with url and facebook id passed in
  def unfuckthat
    status = :internal_server_error
    begin
      # Make sure we have a current fucker and a url
      session[:fucker] || (raise FuckError.new(:forbidden), "No current fucker")
      (params[:url] && params[:url].length > 0) || (raise FuckError.new(:forbidden), "No URL")

      That.transaction do
        begin
          # Get the that
          (that = That.first(:conditions => {:url => params[:url]})) ||
            (raise FuckError.new(:forbidden), "Unknown URL: #{params[:url]}")

          # Get the fuck
          (@fuck = Fuck.first(:conditions => {:fucker_id => session[:fucker].id, :that_id => that.id})) ||
            (raise FuckError.new(:unprocessable_entity), "Fucker hasn't fucked that.")

          delete_fuck # delete_fuck renders on its own
          return
        rescue => err
          raise FuckError.new(:unprocessable_entity), err
        end
      end
    rescue FuckError => e
      $log.warn(e.message)
      respond_to do |format|
        format.json { render json: e.message, status: e.status }
      end
    end
  end
  
  # GET /fucks/get_fuckthat
  # Get a fuck based on current fucker and content
  def get_fuckthat
    # Valid fucker?
    if session[:fucker]
      # Valid url?
      link = extract_link(nil, params)
      link = sanitize_link(link)
      that = That.first(:conditions => {:url => link})
      if that
        # Have a fuck?
        fuck = Fuck.first(:conditions => {:fucker_id => session[:fucker].id, :that_id => that.id})
        if (fuck)
          respond_to do |format|
            format.json { render json: fuck }
          end
        end
      end
    end
    if !fuck
      # Not found
      respond_to do |format|
        format.json { head :no_content }
      end
    end
  end
  
  # POST /fucks/get_fuckthats
  # This is a POST because the query parameters could likely exceed the allowed size for a GET,
  #  even though this is an idempotent call
  # Get an array of fucks based on current fucker and array of urls
  def get_fuckthats
    info = {}
    if params[:urls]
      # Expect array of URLs, return that and my_fuck for each url found
      params[:urls].each do |url,x|
        # Find that
        url_clean = sanitize_link(url)
        that = That.first(:conditions => {:url => url_clean})
        if that
          # Have a fuck for this fucker?
          info[url] = {
            :that => that,
            :my_fuck => (session[:fucker] ? Fuck.first(:conditions => {:fucker_id => session[:fucker].id, :that_id => that.id}) : nil)
          }
        end
      end
    end
    respond_to do |format|
      format.json { render json: info }
    end
  end
end
