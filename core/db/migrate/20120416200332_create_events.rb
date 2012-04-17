class CreateEvents < ActiveRecord::Migration
  def change
    create_table :events do |t|
      t.references :fuck
      t.references :that
      t.references :fucker
      t.boolean :withdraw
      t.timestamp :fuck_created_at
      t.string :session_id
      
      t.timestamps
    end
    add_index :events, :fuck_id
    add_index :events, :that_id
    add_index :events, :fucker_id
  end
end
