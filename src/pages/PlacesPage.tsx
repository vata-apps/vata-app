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
  
  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingPlace, setEditingPlace] = useState<number | null>(null)
  const [newPlace, setNewPlace] = useState({
    name: '',
    typeId: 0,
    parentId: null as number | null,
    latitude: null as number | null,
    longitude: null as number | null
  })
  const [editPlace, setEditPlace] = useState({
    name: '',
    typeId: 0,
    parentId: null as number | null,
    latitude: null as number | null,
    longitude: null as number | null
  })

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
      
      // Set default type ID if available
      if (typesData.length > 0 && newPlace.typeId === 0) {
        setNewPlace(prev => ({ ...prev, typeId: typesData[0].id }))
      }
    } catch (err) {
      setError(`Error loading places: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  async function createPlace() {
    if (!newPlace.name.trim()) {
      alert('Please enter a place name')
      return
    }

    try {
      const createdPlace = await places.create(treeId, {
        name: newPlace.name,
        typeId: newPlace.typeId,
        parentId: newPlace.parentId,
        latitude: newPlace.latitude,
        longitude: newPlace.longitude,
        gedcomId: null
      })
      
      setPlacesList([...placesList, createdPlace])
      setNewPlace({
        name: '',
        typeId: placeTypes[0]?.id || 0,
        parentId: null,
        latitude: null,
        longitude: null
      })
      setShowCreateForm(false)
    } catch (err) {
      setError(`Error creating place: ${err}`)
    }
  }

  async function deletePlace(placeId: number, placeName: string) {
    if (!confirm(`Are you sure you want to delete "${placeName}"?`)) {
      return
    }

    try {
      await places.delete(treeId, placeId)
      setPlacesList(placesList.filter(p => p.id !== placeId))
    } catch (err) {
      setError(`Error deleting place: ${err}`)
    }
  }

  function startEditPlace(place: Place) {
    setEditingPlace(place.id)
    setEditPlace({
      name: place.name,
      typeId: place.typeId,
      parentId: place.parentId,
      latitude: place.latitude,
      longitude: place.longitude
    })
  }

  function cancelEdit() {
    setEditingPlace(null)
    setEditPlace({
      name: '',
      typeId: 0,
      parentId: null,
      latitude: null,
      longitude: null
    })
  }

  async function saveEdit(placeId: number) {
    if (!editPlace.name.trim()) {
      alert('Please enter a place name')
      return
    }

    try {
      console.log('Updating place with:', {
        placeId,
        name: editPlace.name,
        typeId: editPlace.typeId,
        parentId: editPlace.parentId,
        latitude: editPlace.latitude,
        longitude: editPlace.longitude
      })
      
      const updatedPlace = await places.update(treeId, placeId, {
        name: editPlace.name,
        typeId: editPlace.typeId,
        parentId: editPlace.parentId,
        latitude: editPlace.latitude,
        longitude: editPlace.longitude
      })
      
      console.log('Updated place result:', updatedPlace)
      
      setPlacesList(placesList.map(p => p.id === placeId ? updatedPlace : p))
      setEditingPlace(null)
    } catch (err) {
      console.error('Error updating place:', err)
      setError(`Error updating place: ${err}`)
    }
  }

  if (loading) return <div>Loading places...</div>
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>

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
        <button onClick={loadData} style={{ marginRight: "10px" }}>Refresh</button>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{ backgroundColor: showCreateForm ? "#ccc" : "#4CAF50", color: "white", border: "none", padding: "8px 16px" }}
        >
          {showCreateForm ? 'Cancel' : 'Create Place'}
        </button>
      </div>

      {/* Create Place Form */}
      {showCreateForm && (
        <div style={{ padding: "20px", backgroundColor: "#f9f9f9", marginBottom: "20px", border: "1px solid #ddd" }}>
          <h3>Create New Place</h3>
          <div style={{ marginBottom: "10px" }}>
            <label>Name: </label>
            <input
              type="text"
              value={newPlace.name}
              onChange={(e) => setNewPlace(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter place name..."
              style={{ padding: "5px", width: "200px" }}
            />
          </div>
          
          <div style={{ marginBottom: "10px" }}>
            <label>Type: </label>
            <select
              value={newPlace.typeId}
              onChange={(e) => setNewPlace(prev => ({ ...prev, typeId: parseInt(e.target.value) }))}
              style={{ padding: "5px" }}
            >
              {placeTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>Parent Place: </label>
            <select
              value={newPlace.parentId || ''}
              onChange={(e) => setNewPlace(prev => ({ 
                ...prev, 
                parentId: e.target.value ? parseInt(e.target.value) : null 
              }))}
              style={{ padding: "5px" }}
            >
              <option value="">None</option>
              {placesList.map(place => (
                <option key={place.id} value={place.id}>{place.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>Latitude: </label>
            <input
              type="number"
              step="any"
              value={newPlace.latitude || ''}
              onChange={(e) => setNewPlace(prev => ({ 
                ...prev, 
                latitude: e.target.value ? parseFloat(e.target.value) : null 
              }))}
              placeholder="Optional"
              style={{ padding: "5px", width: "100px" }}
            />
            <label style={{ marginLeft: "20px" }}>Longitude: </label>
            <input
              type="number"
              step="any"
              value={newPlace.longitude || ''}
              onChange={(e) => setNewPlace(prev => ({ 
                ...prev, 
                longitude: e.target.value ? parseFloat(e.target.value) : null 
              }))}
              placeholder="Optional"
              style={{ padding: "5px", width: "100px" }}
            />
          </div>

          <button 
            onClick={createPlace}
            style={{ backgroundColor: "#4CAF50", color: "white", border: "none", padding: "10px 20px", marginRight: "10px" }}
          >
            Create Place
          </button>
        </div>
      )}

      {/* Places List */}
      {placesList.length === 0 ? (
        <p>No places found. Create your first place!</p>
      ) : (
        <div>
          <h2>All Places</h2>
          <div>
            {placesList.map(place => (
              <div key={place.id} style={{ 
                padding: "15px", 
                border: "1px solid #ccc", 
                marginBottom: "10px",
                backgroundColor: "white"
              }}>
                {editingPlace === place.id ? (
                  // Edit Mode
                  <div>
                    <h4>Editing Place</h4>
                    <div style={{ marginBottom: "10px" }}>
                      <label>Name: </label>
                      <input
                        type="text"
                        value={editPlace.name}
                        onChange={(e) => setEditPlace(prev => ({ ...prev, name: e.target.value }))}
                        style={{ padding: "5px", width: "200px" }}
                      />
                    </div>
                    
                    <div style={{ marginBottom: "10px" }}>
                      <label>Type: </label>
                      <select
                        value={editPlace.typeId}
                        onChange={(e) => setEditPlace(prev => ({ ...prev, typeId: parseInt(e.target.value) }))}
                        style={{ padding: "5px" }}
                      >
                        {placeTypes.map(type => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                      <label>Parent Place: </label>
                      <select
                        value={editPlace.parentId || ''}
                        onChange={(e) => setEditPlace(prev => ({ 
                          ...prev, 
                          parentId: e.target.value ? parseInt(e.target.value) : null 
                        }))}
                        style={{ padding: "5px" }}
                      >
                        <option value="">None</option>
                        {placesList.filter(p => p.id !== place.id).map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                      <label>Latitude: </label>
                      <input
                        type="number"
                        step="any"
                        value={editPlace.latitude || ''}
                        onChange={(e) => setEditPlace(prev => ({ 
                          ...prev, 
                          latitude: e.target.value ? parseFloat(e.target.value) : null 
                        }))}
                        style={{ padding: "5px", width: "100px" }}
                      />
                      <label style={{ marginLeft: "20px" }}>Longitude: </label>
                      <input
                        type="number"
                        step="any"
                        value={editPlace.longitude || ''}
                        onChange={(e) => setEditPlace(prev => ({ 
                          ...prev, 
                          longitude: e.target.value ? parseFloat(e.target.value) : null 
                        }))}
                        style={{ padding: "5px", width: "100px" }}
                      />
                    </div>

                    <button 
                      onClick={() => saveEdit(place.id)}
                      style={{ 
                        backgroundColor: "#4CAF50", 
                        color: "white", 
                        border: "none", 
                        padding: "8px 16px",
                        marginRight: "10px" 
                      }}
                    >
                      Save
                    </button>
                    <button 
                      onClick={cancelEdit}
                      style={{ 
                        backgroundColor: "#666", 
                        color: "white", 
                        border: "none", 
                        padding: "8px 16px" 
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  // View Mode
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <Link 
                        to="/$treeId/places/$placeId" 
                        params={{ treeId, placeId: place.id.toString() }}
                        style={{ textDecoration: "none" }}
                      >
                        <strong style={{ fontSize: "18px" }}>{place.name}</strong>
                      </Link>
                      <div style={{ color: "#666", fontSize: "14px" }}>
                        Type: {placeTypes.find(t => t.id === place.typeId)?.name || `ID: ${place.typeId}`}
                        {place.parentId && ` • Parent ID: ${place.parentId}`}
                        {place.latitude && place.longitude && ` • ${place.latitude}, ${place.longitude}`}
                      </div>
                    </div>
                    <div>
                      <button 
                        onClick={() => startEditPlace(place)}
                        style={{ 
                          backgroundColor: "#2196F3", 
                          color: "white", 
                          border: "none",
                          padding: "5px 10px",
                          fontSize: "12px",
                          marginRight: "5px"
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deletePlace(place.id, place.name)}
                        style={{ 
                          backgroundColor: "#f44336", 
                          color: "white", 
                          border: "none",
                          padding: "5px 10px",
                          fontSize: "12px"
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: "30px" }}>
        <h3>Available Place Types</h3>
        <ul>
          {placeTypes.map(type => (
            <li key={type.id}>{type.name} (ID: {type.id}) {type.isSystem ? '(System)' : '(Custom)'}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default PlacesPage;