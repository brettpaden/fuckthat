class CreateFucks < ActiveRecord::Migration
  def change
    create_table :fucks do |t|
      t.references :fucker
      t.references :that

      t.timestamps
    end
    add_index :fucks, :fucker_id
    add_index :fucks, :that_id
  end
end
