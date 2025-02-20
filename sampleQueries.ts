import { DatabaseSync } from 'node:sqlite'

export const queries = () => {
  const database = new DatabaseSync('./Chinook_Sqlite.sqlite')

  const querySelectAll = database.prepare('select * from Artist')
  const querySelectLike = database.prepare('select * from artist where name like \'%Postal%\'')

  console.log('0', querySelectAll.all())
  querySelectLike.all().forEach(artist => {
    console.log('1', artist)
  })
  for (const artist of querySelectLike.iterate()) {
    console.log('2', artist)
  }

  // Get the first row only
  console.log('3', querySelectAll.get())

  console.log('4', querySelectLike.sourceSQL)
  database.close()
}
