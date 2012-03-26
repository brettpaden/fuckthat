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
end
