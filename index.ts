import { helloWorld } from './inMemory.ts'
import { addArtist, deleteArtist, queries, updateArtistName } from './sampleQueries.ts'

helloWorld()
queries()
addArtist({ name: 'Radiohead' })
updateArtistName({ from: 'Radiohead', to: 'DaftPunk' })
deleteArtist({ name: 'DaftPunk_' })
