class CreateThats < ActiveRecord::Migration
  def change
    create_table :thats do |t|
      t.string :url
      t.string :title
      t.string :picture
      t.integer :fuck_count, :default => 0
      t.boolean :dont_aggregate, :default => false, :null => false

      t.timestamps
    end
  end
end
