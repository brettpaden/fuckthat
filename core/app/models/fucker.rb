
class Fucker < ActiveRecord::Base
  # Whitelist these attributes
  attr_accessible :name, :facebook_id
  
  # Validations
  validates :name, :presence => true 
  validates :facebook_id, :presence => true, :uniqueness => true
  
  # Associations
  has_many :fucks, :dependent => :destroy
  has_many :thats, :through => :fucks  
end


