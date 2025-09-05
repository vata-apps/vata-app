import { Link, useParams } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { places } from '../lib/places'
import { Place, PlaceType } from '../lib/db/schema'

function PlacesPage() {
  const { treeId } = useParams({ from: '/$treeId/places' })
  const [placesList, setPlacesList] = useState<Place[]>([])
  const [placeTypes, setPlaceTypes] = useState<PlaceType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [treeId])

  async function loadData() {
    try {
      setLoading(true)
      const [placesData, typesData] = await Promise.all([
        places.getAll(treeId),
        places.getPlaceTypes(treeId)
      ])
      setPlacesList(placesData)
      setPlaceTypes(typesData)
    } catch (err) {
      setError(`Error loading places: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading places...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link to="/$treeId" params={{ treeId }} style={{ color: "#666" }}>
          ← Back to {treeId}
        </Link>
      </div>
      
      <h1>Places in {treeId}</h1>
      
      <div style={{ marginBottom: "20px" }}>
        <p>Found {placesList.length} places</p>
        <button onClick={loadData}>Refresh</button>
      </div>

      {placesList.length === 0 ? (
        <p>No places found. Create your first place!</p>
      ) : (
        <div>
          <h2>All Places</h2>
          <ul>
            {placesList.map(place => (
              <li key={place.id} style={{ marginBottom: "10px" }}>
                <Link 
                  to="/$treeId/places/$placeId" 
                  params={{ treeId, placeId: place.id.toString() }}
                  style={{ textDecoration: "none" }}
                >
                  <strong>{place.name}</strong>
                </Link>
                {place.parentId && <span> (Parent ID: {place.parentId})</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: "30px" }}>
        <h3>Place Types Available</h3>
        <ul>
          {placeTypes.map(type => (
            <li key={type.id}>{type.name} {type.isSystem ? '(System)' : '(Custom)'}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default PlacesPage;