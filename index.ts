// import { helloWorld } from './inMemory.ts'
import { fullTextSearch, /* addArtist, addTrack, deleteArtist, queries, updateArtistName */ } from './sampleQueries.ts'

// helloWorld()
// queries()
// addArtist({ name: 'Radiohead' })
// updateArtistName({ from: 'Radiohead', to: 'DaftPunk' })
// deleteArtist({ name: 'DaftPunk_' })
// // Testing how node:sqlite enforces foreign keys constraint.
// addTrack({
//   name: 'lol',
//   albumId: 9999,
//   mediaTypeId: 9999,
//   genreId: 9999,
//   composer: 'lol',
//   milliseconds: 9999,
//   bytes: 9999,
//   unitPrice: 9999
// })
fullTextSearch({ search: 'black' })
