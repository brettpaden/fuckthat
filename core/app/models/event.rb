class Event < ActiveRecord::Base
  attr_accessible :fuck_id, :that_id, :fucker_id, :withdraw, :fuck_created_at, :session_id

  validates_associated :fuck
  validates_associated :that
  validates_associated :fucker
  
  belongs_to :fuck
  belongs_to :that
  belongs_to :fucker
  
  def self.events_by_ts(ts, count)
    if (ts)
      t = Time.at(ts.to_i)
      condition = "created_at > '#{t.gmtime}'"
    else 
      condition = ''
    end
    
    limit = if count then count.to_i else nil end
      
    # Get most recent events
    @events = Event.find(:all, :order => 'created_at', :conditions => condition, :limit => limit)
  end
end
