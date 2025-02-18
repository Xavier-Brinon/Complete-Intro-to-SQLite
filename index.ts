import { DatabaseSync } from 'node:sqlite'

const database = new DatabaseSync(':memory:')

database.exec(`
  create table data(
    key   INTEGER PRIMARY KEY,
    value TEXT
  ) strict
`)

const insert = database.prepare('insert into data (key, value) values (?, ?)')

insert.run(1, 'hello')
insert.run(2, 'world')

const query = database.prepare('select * from data order by key')

console.log(query.all())
