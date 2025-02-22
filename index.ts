import { helloWorld } from './inMemory.ts'
import { addArtist, queries } from './sampleQueries.ts'

helloWorld()
queries()
addArtist({ name: 'Radiohead' })
addArtist({ name: 'DaftPunk' })
