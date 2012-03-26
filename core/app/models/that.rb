class That < ActiveRecord::Base
  # Whitelist these attributes
  attr_accessible :url, :fuck_count
  
  # Validations
  validates :url, :uniqueness => true, :length => { :minimum => 1 }
	
  # Associations
  has_many :fuckers, :through => :fucks
	has_many :fucks, :dependent => :destroy
end
