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
  def self.fucks_by_fucker(fid, agg_only)
    Fuck.joins(:that).
      where("fucker_id = #{fid}" + (agg_only ? " AND NOT thats.dont_aggregate" : ""))
  end

  # Get fucks created since given time
  def self.fucks_since_time(time, order, agg_only)
    Fuck.joins(:that).
      where("fucks.created_at >= #{time}" + (agg_only ? " AND NOT thats.dont_aggregate" : "")).
      order(:order)
  end
end
