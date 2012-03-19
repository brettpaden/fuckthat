class CreateFucks < ActiveRecord::Migration
  def change
    create_table :fucks do |t|
      t.fucker :references
      t.that :references

      t.timestamps
    end
  end
end
