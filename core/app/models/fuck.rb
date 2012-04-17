class Fuck < ActiveRecord::Base
  # Whitelist these attributes
  attr_accessible :that_id, :fucker_id
  
  # Validations
  validates :that_id, :presence => true
  validates :fucker_id, :presence => true
  validates_associated :that, :fucker
	
  # Associations
  belongs_to :that, :autosave => true
  belongs_to :fucker

  # Get fucks for a particular 'fucker'  
  def self.fucks_by_fucker(fid)
    find(:all, :conditions => "fucker_id = #{fid}")
  end  
  
  # Get fucks created since given time
  def self.fucks_since_time(time, order)
    find(:all, :conditions => "created_at >= #{time}", :order => order)
  end
end
