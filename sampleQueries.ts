import { DatabaseSync } from 'node:sqlite'
import { strict as assert } from 'node:assert'

interface IArtist {
  ArtistId: number
  Name: string
}

export const queries = () => {
  const chinookDB = new DatabaseSync('./Chinook_Sqlite.sqlite', {
    readOnly: true
  })

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

/**
 * CREATE TABLE [Track]
 * (
 *   [TrackId] INTEGER  NOT NULL,
 *   [Name] NVARCHAR(200)  NOT NULL,
 *   [AlbumId] INTEGER,
 *   [MediaTypeId] INTEGER  NOT NULL,
 *   [GenreId] INTEGER,
 *   [Composer] NVARCHAR(220),
 *   [Milliseconds] INTEGER  NOT NULL,
 *   [Bytes] INTEGER,
 *   [UnitPrice] NUMERIC(10,2)  NOT NULL,
 *   CONSTRAINT [PK_Track] PRIMARY KEY  ([TrackId]),
 *   FOREIGN KEY ([AlbumId]) REFERENCES [Album] ([AlbumId])
 *               ON DELETE NO ACTION ON UPDATE NO ACTION,
 *   FOREIGN KEY ([GenreId]) REFERENCES [Genre] ([GenreId])
 *               ON DELETE NO ACTION ON UPDATE NO ACTION,
 *   FOREIGN KEY ([MediaTypeId]) REFERENCES [MediaType] ([MediaTypeId])
 *               ON DELETE NO ACTION ON UPDATE NO ACTION
 * );
 * CREATE INDEX [IFK_TrackAlbumId] ON [Track] ([AlbumId]);
 * CREATE INDEX [IFK_TrackGenreId] ON [Track] ([GenreId]);
 * CREATE INDEX [IFK_TrackMediaTypeId] ON [Track] ([MediaTypeId]);
 */

interface ITrack {
  name: string
  albumId?: number
  mediaTypeId: number
  genreId?: number
  composer?: string
  milliseconds: number
  bytes?: number
  unitPrice: number
}
export const addTrack = ({
  name,
  albumId,
  mediaTypeId,
  genreId,
  composer,
  milliseconds,
  bytes,
  unitPrice
}: ITrack = {} as ITrack) => {
  assert.ok(typeof name === 'string', `The name should be a string, got ${typeof name}`)
  assert.ok(0 < name.length && name.length <= 200, `The table expect name to be max 200 chars, got ${name.length}`)
  assert.ok(typeof albumId === 'number' || albumId === undefined, `The albumId should be a number, got ${typeof albumId}`)
  assert.ok(typeof mediaTypeId === 'number', `The mediaTypeId should be a number, got ${typeof mediaTypeId}`)
  assert.ok(typeof genreId === 'number' || genreId === undefined, `The genreId should be a number, got ${typeof genreId}`)
  assert.ok(typeof composer === 'string' || composer === undefined, `The composer should be a string, got ${typeof composer}`)
  assert.ok(
    composer === undefined || 0 < composer.length && composer.length <= 220,
    `The table expect composer to be max 220 chars, got ${composer?.length ?? 0}`
  )
  assert.ok(typeof milliseconds === 'number', `The milliseconds should be a number, got ${typeof milliseconds}`)
  assert.ok(typeof bytes === 'number' || bytes === undefined, `The bytes should be a number, got ${typeof bytes}`)
  assert.ok(typeof unitPrice === 'number', `The unitPrice should be a number, got ${typeof unitPrice}`)

  if (name && mediaTypeId && milliseconds && unitPrice) {
    const chinookDB = new DatabaseSync('./Chinook_Sqlite.sqlite')
    const prepAddTrack = chinookDB.prepare('insert into [Track] ([Name], [AlbumId], [MediaTypeId], [GenreId], [Composer], [Milliseconds], [Bytes], [UnitPrice]) values (?, ?, ?, ?, ?, ?, ?, ?) returning *')
    const addTrackLog = prepAddTrack.all(
      name,
      albumId ?? 'null',
      mediaTypeId,
      genreId ?? 'null',
      composer ?? 'null',
      milliseconds,
      bytes ?? 'null',
      unitPrice)
    console.log(addTrackLog)

    chinookDB.close()
  }
}

export const fullTextSearch = ({ search } : { search: string }) => {
  assert.ok(typeof search === 'string', `The search text should be a string, got ${typeof search}`)
  assert.ok(search !== '', 'Search text is empty')

  const chinookDB = new DatabaseSync('./Chinook_Sqlite.sqlite', {
    allowExtension: true
  })
  // Create the view with the right data
  const prepCreateView = chinookDB.prepare(`
    create view View_Tracks as
    select
      Track.TrackId as TrackId,
      Artist.Name as ArtistName,
      Album.Title as AlbumTitle,
      Track.Name as TrackName
    from [Track]
    join [Album]  on Track.AlbumId  = Album.AlbumId
    join [Artist] on Album.ArtistId = Artist.ArtistId
    `)
  const runCreateView = prepCreateView.run()
  console.debug('Create the View:', runCreateView)

  // Create the virtual table where the Full Text Search will be executed.
  const prepCreateVirtual = chinookDB.prepare(`
    create virtual table FTS_Track
    using FTS5(content='View_Tracks', content_rowid='TrackId', ArtistName, AlbumTitle, TrackName)
  `)
  const runCreateVirtual = prepCreateVirtual.run()
  console.debug('Create the Virtual table:', runCreateVirtual)

  // Fill in the virtual table
  const prepFillVirtual = chinookDB.prepare(`
    insert into FTS_Track
    select TrackId, ArtistName, AlbumTitle
    from View_Tracks
    returning *
  `)
  const runFillVirtual = prepFillVirtual.run()
  console.debug('Fill virtual table:', runFillVirtual)

  chinookDB.close()
}
