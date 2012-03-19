class CreateThats < ActiveRecord::Migration
  def change
    create_table :thats do |t|
      t.string :url
      t.integer :fuck_count

      t.timestamps
    end
  end
end
