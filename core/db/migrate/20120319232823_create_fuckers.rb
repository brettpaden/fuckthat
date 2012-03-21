class CreateFuckers < ActiveRecord::Migration
  def change
    create_table :fuckers do |t|
      t.string :name
      t.string :password_digest
      t.integer :facebook_id

      t.timestamps
    end
  end
end
