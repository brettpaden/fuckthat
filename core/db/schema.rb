# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20120416200332) do

  create_table "events", :force => true do |t|
    t.integer  "fuck_id"
    t.integer  "that_id"
    t.integer  "fucker_id"
    t.boolean  "withdraw"
    t.datetime "fuck_created_at"
    t.string   "instance_id"
    t.datetime "created_at",      :null => false
    t.datetime "updated_at",      :null => false
  end

  add_index "events", ["fuck_id"], :name => "index_events_on_fuck_id"
  add_index "events", ["fucker_id"], :name => "index_events_on_fucker_id"
  add_index "events", ["that_id"], :name => "index_events_on_that_id"

  create_table "fuckers", :force => true do |t|
    t.string   "name"
    t.string   "password_digest"
    t.integer  "facebook_id",     :limit => 8
    t.datetime "created_at",                   :null => false
    t.datetime "updated_at",                   :null => false
  end

  create_table "fucks", :force => true do |t|
    t.integer  "fucker_id"
    t.integer  "that_id"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "fucks", ["fucker_id"], :name => "index_fucks_on_fucker_id"
  add_index "fucks", ["that_id"], :name => "index_fucks_on_that_id"

  create_table "thats", :force => true do |t|
    t.string   "url"
    t.string   "title"
    t.string   "picture"
    t.integer  "fuck_count",     :default => 0
    t.boolean  "dont_aggregate", :default => false, :null => false
    t.datetime "created_at",                        :null => false
    t.datetime "updated_at",                        :null => false
  end

end
