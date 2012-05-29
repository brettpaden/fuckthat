class That < ActiveRecord::Base
  # Whitelist these attributes
  attr_accessible :url, :title, :fuck_count
  
  # Validations
  validates :url, :uniqueness => true, :length => { :minimum => 1 }
	
  # Associations
  has_many :fuckers, :through => :fucks
	has_many :fucks, :dependent => :destroy
  
  # Get top n thats of all time
  def self.top_thats(limit, arr)
    arr |= find(:all, :order => 'fuck_count DESC, created_at DESC', :limit => limit)
  end
  
  # Get fuck count for period of time specified
  def fuck_count_since(time)
    Fuck.where("created_at >= '#{time}' and that_id = #{id}").count
  end
      
  # Get top n thats for period of time specified, merge with existing array, and add
  # the requested fields to the elements of the array indicating fuck_count for that period
  def self.top_thats_since(time, limit, arr)
    # Get fucks created since the given time, with fuck_count added, grouped by that_id, sorted by fuck_count
    counts = Fuck.where("created_at >= '#{time}'").
      group(:that_id).
      order('count_all DESC').
      limit(limit).
      count

    # Add each that to our array if not already added
    counts.each do |that_id, count|
      unless arr.any? {|a| a.id == that_id} then arr << That.find(that_id) end
    end
    
    # Return counts
    counts
  end
  
  # Get current fucker's fuck for this that, if any
  def my_fuck(fid)
    fucks.find { |f| f.fucker_id == fid && f.that_id == id }
  end
end


