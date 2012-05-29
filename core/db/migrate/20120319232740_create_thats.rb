class CreateThats < ActiveRecord::Migration
  def change
    create_table :thats do |t|
      t.string :url
      t.string :title
      t.integer :fuck_count, :default => 0

      t.timestamps
    end
  end
end
