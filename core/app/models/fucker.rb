
class Fucker < ActiveRecord::Base
  # Secure password
  has_secure_password

  # Whitelist these attributes
  attr_accessible :name, :password, :facebook_id
  
  # Validations
  validates :name, :presence => true, :uniqueness => true
  validates :password_digest, :presence => true
  
  # Associations
  has_many :fucks, :dependent => :destroy
  has_many :thats, :through => :fucks  

  # Authenticate
  def self.authenticate(name, password)
    find_by_name(name).try(:authenticate, password)
  end
end


