import { DatabaseSync } from 'node:sqlite'
import { strict as assert } from 'node:assert'

interface IArtist {
  ArtistId: number
  Name: string
}

export const queries = () => {
  const chinookDB = new DatabaseSync('./Chinook_Sqlite.sqlite')

  // const querySelectAll = chinookDB.prepare('select * from [Artist]')

  /**
   * Iterators and map.
  const querySelectLike = chinookDB.prepare('select * from [Artist] where [Name] like \'%Postal%\'')
  querySelectLike.all().forEach(artist => {
    console.log('1', artist)
  })
  for (const artist of querySelectLike.iterate()) {
    console.log('2', artist)
  }
  console.log('4', querySelectLike.sourceSQL)

  */

  // Pagination from 10 to 10.
  const firstPageArtists = chinookDB.prepare('select * from [Artist] limit 10')
  // const secondPageArtists = chinookDB.prepare('select * from [Artist] limit 10 offset 10')

  // console.log('0, page 1', firstPageArtists.all())
  // console.log('0, page 2', secondPageArtists.all())

  /**
   * A better pagination is to get the last ID displayed,
   * and start the limit of the next page from here.
   */
  const pageOne = firstPageArtists.all() as [IArtist]
  console.log('0, better page 1', pageOne)
  const { ArtistId } = pageOne.length > 0 ? pageOne.at(-1) as IArtist : { ArtistId: null }
  if (ArtistId) {
    const pageTwo = chinookDB.prepare(`select * from [Artist] where [ArtistId] > ${ArtistId} limit 10`)
    console.log('0, better page 2', pageTwo.all())
  }

  // Get the first row only
  // console.log('3', querySelectAll.get())

  chinookDB.close()
}

export const addArtist = ({ name }: { name : string }) => {

assert.ok(typeof name === 'string', `The name should be a string, got ${typeof name}`)
  assert.ok(0 < name.length && name.length <= 120, `The table expect name to be max 120 chars, got ${name.length}`)
  const chinookDB = new DatabaseSync('./Chinook_Sqlite.sqlite')

  // Does the Artist name already exist in the table?
  const prepFindArtist = chinookDB.prepare('select * from [Artist] where [Name] = ?')
  const artistsFound = prepFindArtist.all(name)

  if (artistsFound.length === 0) {
    const prepCountArtist = chinookDB.prepare('select count(*) from [Artist]')
    const sizeBeforeLog = prepCountArtist.get() as { 'count(*)': number }
    const countBefore = sizeBeforeLog['count(*)']

    const prepInsert = chinookDB.prepare('insert into [Artist] ([Name]) values (?)')
    const insertLog = prepInsert.run(name)

    const sizeAfter = prepCountArtist.get() as { 'count(*)': number }
    const countAfter = sizeAfter['count(*)']

    console.log({ countBefore, insertLog, countAfter })
  } else {
    console.log(`Artist ${name} found in the table: ${JSON.stringify(artistsFound[0])}`)
  }

  chinookDB.close()
}

export const updateArtistName = ({ from: previousName, to: newName }: { from: string, to: string} ) => {
  assert.ok(typeof previousName === 'string', `The name should be a string, got ${typeof previousName}`)
  assert.ok(typeof newName === 'string', `The name should be a string, got ${typeof newName}`)
  assert.ok(0 < previousName.length && previousName.length <= 120, `The table expect name to be max 120 chars, got ${previousName.length}`)
  assert.ok(0 < newName.length && newName.length <= 120, `The table expect name to be max 120 chars, got ${newName.length}`)
  const chinookDB = new DatabaseSync('./Chinook_Sqlite.sqlite')

  const prepFindArtist = chinookDB.prepare('select * from [Artist] where [Name] = ?')
  const artistsFound = prepFindArtist.all(previousName)

  if (artistsFound.length === 0) {
    console.log(`${previousName} doesn't exist in the DB.`)
    chinookDB.close()
    return
  }

  if (artistsFound.length > 1 ) {
    console.log(`${previousName} has been found more than once.`)
    chinookDB.close()
    return
  }

  const prepUpdate = chinookDB.prepare('update [Artist] set [Name] = ? where [Name] = ?')
  const updateLog = prepUpdate.run(newName, previousName)
  console.log(updateLog)

  // Adds an _ to illustrate using `returning` in the SQL Statement
  const prepUpdate_ = chinookDB.prepare('update [Artist] set [Name] = ? where [Name] = ? returning *')
  const update_log = prepUpdate_.all(`${newName}_`, newName)
  console.log(update_log)

  chinookDB.close()
}

export const deleteArtist = ({ name }: { name: string }) => {
  assert.ok(typeof name === 'string', `The name should be a string, got ${typeof name}`)
  assert.ok(0 < name.length && name.length <= 120, `The table expect name to be max 120 chars, got ${name.length}`)

  const chinookDB = new DatabaseSync('./Chinook_Sqlite.sqlite')
  const prepDelete = chinookDB.prepare('delete from [Artist] where [Name] = ? returning *')
  const deleteLog = prepDelete.all(name)
  console.log(deleteLog)
  chinookDB.close()
}
