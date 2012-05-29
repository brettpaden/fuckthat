class Event < ActiveRecord::Base
  # Whitelist these attributes
  attr_accessible :fuck_id, :that_id, :fucker_id, :withdraw, :fuck_created_at, :instance_id

  # Validations
  validates_associated :fuck
  validates_associated :that
  validates_associated :fucker
  
  # Associations
  belongs_to :fuck
  belongs_to :that
  belongs_to :fucker
  
  # Get all events since event indicated by id, with count
  def self.events_since_id(id, count)
    if (id)
      condition = "id > #{id}"
    else 
      condition = ''
    end
    
    limit = if count then count.to_i else nil end
      
    # Get most recent events
    @events = Event.find(:all, :order => 'created_at', :conditions => condition, :limit => limit)
  end
end
