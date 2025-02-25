import { DatabaseSync } from 'node:sqlite'
import { strict as assert } from 'node:assert'

interface Iinvoice {
  InvoiceId: number
  CustomerId: number
  InvoiceDate: string
  BillingAddress?: string
  BillingCity?: string
  BillingState?: string
  BillingCountry?: string
  BillingPostalCode?: string
  Total: number
}

interface IinvoiceLine {
  InvoiceLineId: number
  InvoiceId: number
  TrackId: number
  UnitPrice: number
  Quantity: number
}

interface ITrack {
  TrackId: number
  TrackName: number             // Should be Name.
  AlbumId: number
  MediaTypeId: number
  GenreId?: number
  Composer?: string
  Milliseconds: number
  Bytes: number
  UnitPrice: number
}

interface IAlbum {
  AlbumId: number
  Title: string
  ArtistId: number
}

interface IArtist {
  ArtistId: number
  ArtistName: number            // Should be Name.
}

interface ITrackInvoiceLine extends ITrack, IinvoiceLine, IAlbum, IArtist {}

const db = new DatabaseSync('./data.db')

export default function registerInvoice(fastify, opts, done) {
  fastify.all('/', (request, reply) => {
    const id: number = Number.parseInt(request.query.id, 10)
    assert.ok(typeof id === 'number', `id should be a number, got ${typeof id}`)

    const prepInvoice = db.prepare('select * from [Invoice] where [InvoiceId] = ?')
    // Could be prepInvoice.get, but I want to check the number or invoices.
    const allInvoices = prepInvoice.all(id) as Iinvoice[]
    assert.ok(
      allInvoices.length <= 1,
      `Invoices should be unique, got ${allInvoices.length} results for Invoice ${id}`)
    const {
      InvoiceDate: date,
      BillingAddress: address,
      BillingCity: city,
      BillingState: state,
      BillingCountry: country,
      BillingPostalCode: postalCode,
      Total: total
    } = allInvoices[0]

    const invoice = {
      id,
      date,
      address,
      city,
      state,
      country,
      postalCode,
      total
    }

    const prepInvoiceLines = db.prepare(`
select InvoiceLine.UnitPrice, InvoiceLine.Quantity, Track.Name as TrackName, Album.Title, Artist.Name as ArtistName
from [InvoiceLine]
join [Track] on InvoiceLine.TrackId = Track.TrackId
join [Album] on Track.AlbumId = Album.AlbumId
join [Artist] on Album.ArtistId = Artist.ArtistId
where InvoiceLine.InvoiceId = ?`)
    const allInvoiceLines = prepInvoiceLines.all(id) as ITrackInvoiceLine[]
    const lines = allInvoiceLines.map(line => {
      const {
        UnitPrice: unitPrice,
        Quantity: quantity,
        TrackName: trackName,
        Title: albumTitle,
        ArtistName: artistName
      } = line
      return {
        unitPrice,
        quantity,
        trackName,
        albumTitle,
        artistName
      }
    })
    reply.send({ invoice, lines })
  })

  done()
}
