import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

const INITIAL_INGREDIENTS = [
  { id: 1, name: 'All-Purpose High-Protein Flour', mass: 450, purity: '99.8%', color: 'var(--accent-pink)' },
  { id: 2, name: 'Refined Cane Sugar (Micro-grind)', mass: 300, purity: '100.0%', color: 'var(--accent-cyan)' },
  { id: 3, name: 'Grass-fed Unsalted Butter', mass: 225, purity: '82.5%', color: '#bec6e0' },
  { id: 4, name: 'Pure Madagascar Vanilla Isolate', mass: 15, purity: '95.0%', color: '#909097' },
];

const REGIONS_CONFIG = [
  { key: 'hanoi', label: 'Hanoi Variant', regionCode: 'REGION_CODE: HAN_01', badge: { text: 'OPTIMIZED', color: '#10B981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' }, confidence: '94.2%', confColor: 'var(--accent-cyan)', confBg: 'rgba(34,211,238,0.1)', accentBorder: 'var(--accent-cyan)', adjustment: 'Reduce sucrose by 15%.', insight: '"Historical data suggests Northern demographics prefer balanced sweetness."', btnColor: 'var(--accent-cyan)' },
  { key: 'danang', label: 'Da Nang Variant', regionCode: 'REGION_CODE: DAD_02', badge: { text: 'BALANCED', color: '#bec6e0', bg: 'rgba(190,198,224,0.15)', border: 'rgba(190,198,224,0.3)' }, confidence: '88.7%', confColor: 'var(--accent-pink)', confBg: 'rgba(244,114,182,0.1)', accentBorder: 'var(--accent-pink)', adjustment: 'Stable sucrose levels.', insight: '"Coastal palette trends indicate high receptivity to standard sweetness."', btnColor: 'var(--accent-pink)' },
  { key: 'hcm', label: 'Ho Chi Minh City', regionCode: 'REGION_CODE: SGN_03', badge: { text: 'TRENDING', color: '#fb923c', bg: 'rgba(251,146,60,0.15)', border: 'rgba(251,146,60,0.3)' }, confidence: '91.5%', confColor: '#10B981', confBg: 'rgba(16,185,129,0.1)', accentBorder: '#10B981', adjustment: 'Increase sucrose by 8%.', insight: '"Southern markets exhibit high sugar affinity."', btnColor: '#10B981' },
];

export default function CreateProductPage() {
  const [productName, setProductName] = useState('');
  const [ingredients, setIngredients] = useState(INITIAL_INGREDIENTS);
  const [recipeTitle, setRecipeTitle] = useState('Original Recipe');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [savedMsg, setSavedMsg] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const removeIngredient = (id) => setIngredients(prev => prev.filter(i => i.id !== id));
  const updateMass = (id, mass) => setIngredients(prev => prev.map(i => i.id === id ? { ...i, mass: Number(mass) } : i));
  const updateName = (id, name) => setIngredients(prev => prev.map(i => i.id === id ? { ...i, name } : i));
  const addIngredient = () => setIngredients(prev => [...prev, { id: Date.now(), name: 'New Ingredient', mass: 100, purity: '100%', color: '#909097' }]);
  
  const applyVariant = (regionKey) => {
    setIngredients(prev => {
      let newIngs = [...prev];
      if (regionKey === 'hanoi') {
        newIngs = newIngs.map(i => {
          if (i.name.includes('Sugar')) return { ...i, mass: Math.round(i.mass * 0.85) };
          return i;
        });
      } else if (regionKey === 'danang') {
        // Stays the same
      } else if (regionKey === 'hcm') {
        newIngs = newIngs.map(i => {
          if (i.name.includes('Sugar')) return { ...i, mass: Math.round(i.mass * 1.08) };
          return i;
        });
      }
      setRecipeTitle('Recipe');
      return newIngs;
    });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!productName.trim()) {
      alert("Please enter a product name.");
      return;
    }
    
    const formData = new FormData();
    formData.append('name', productName);
    formData.append('ingredients', JSON.stringify(ingredients));
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const response = await fetch('http://localhost:8000/api/products', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 2000);
        // Optional: clear form
        // setProductName(''); setIngredients(INITIAL_INGREDIENTS); setImageFile(null); setImagePreview('');
      } else {
        alert("Error saving product: " + data.detail);
      }
    } catch (err) {
      alert("Failed to connect to the server.");
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '256px' }}>
        <TopBar />
        <main style={{ padding: '88px 40px 40px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
            <div>
              <h1 className="text-headline-lg" style={{ marginBottom: '4px' }}>Create New Product</h1>
              <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>Initialize a new formula declaration with regional AI optimization parameters.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-ghost" style={{ border: '1px solid var(--border-glass)' }} onClick={() => { setProductName(''); setIngredients(INITIAL_INGREDIENTS); setRecipeTitle('Original Recipe'); }}>Discard Draft</button>
              <button className="btn btn-secondary" onClick={handleSave}>{savedMsg ? '✅ Saved!' : 'Save Declaration'}</button>
            </div>
          </div>

          {/* Middle Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '4fr 8fr', gap: '24px', marginBottom: '32px' }}>
            {/* Left: Base Product Info */}
            <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>📦</span>
                <h2 className="text-headline-sm">Base Product Info</h2>
              </div>
              <div className="input-group">
                <label className="input-label">CAKE_NAME_ID</label>
                <input className="input-field" placeholder="e.g., Midnight Velvet Raspberry" value={productName} onChange={e => setProductName(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">VISUAL_ANCHOR_UPLOAD</label>
                <div 
                  style={{ 
                    aspectRatio: '16/9', background: 'rgba(15,23,42,0.8)', border: '2px dashed var(--border-glass)', 
                    borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', 
                    justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'border-color 0.2s',
                    position: 'relative', overflow: 'hidden'
                  }}
                  onClick={() => document.getElementById('product-image-upload').click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <>
                      <span style={{ fontSize: '32px' }}>☁️</span>
                      <span className="text-label-mono" style={{ color: 'var(--text-secondary)' }}>Drop HQ PNG/JPG or Browse</span>
                    </>
                  )}
                  <input 
                    id="product-image-upload" 
                    type="file" 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={handleImageChange} 
                  />
                </div>
              </div>
            </div>

            {/* Right: Original Recipe Table */}
            <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.05, fontSize: '160px', pointerEvents: 'none' }}>⚗️</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent-cyan)', fontSize: '20px' }}>🔬</span>
                  <h2 className="text-headline-sm">{recipeTitle}</h2>
                </div>
                <button className="btn btn-ghost" onClick={addIngredient} style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', gap: '4px' }}>
                  + ADD_COMPONENT
                </button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    {['INGREDIENT_ID', 'MASS (G)', 'PURITY (%)', 'ACTION'].map((h, i) => (
                      <th key={h} className="text-label-mono" style={{ padding: '8px', textAlign: i === 3 ? 'center' : 'left', color: 'var(--text-secondary)', fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map(ing => (
                    <tr key={ing.id} style={{ borderBottom: '1px solid var(--border-glass)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '12px 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: ing.color, flexShrink: 0 }}></span>
                        <input type="text" value={ing.name} onChange={e => updateName(ing.id, e.target.value)} className="input-field" style={{ padding: '4px 8px', fontSize: '14px', width: '100%', background: 'transparent', border: '1px dashed transparent' }} onFocus={e => e.target.style.borderColor = 'var(--border-glass)'} onBlur={e => e.target.style.borderColor = 'transparent'} />
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <input type="number" value={ing.mass} onChange={e => updateMass(ing.id, e.target.value)} className="input-field" style={{ width: '80px', padding: '4px 8px', fontSize: '13px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }} />
                      </td>
                      <td style={{ padding: '12px 8px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-secondary)' }}>{ing.purity}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <button onClick={() => removeIngredient(ing.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '18px', transition: 'color 0.2s' }}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Regional Recommendations */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <span style={{ color: 'var(--accent-cyan)', fontSize: '20px' }}>🧠</span>
            <h2 className="text-headline-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Regional Recommendations</h2>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)' }}></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {REGIONS_CONFIG.map(r => (
              <div key={r.key} className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s' }}>
                {/* Region header with city image placeholder */}
                <div style={{ height: '160px', background: `linear-gradient(135deg, ${r.confBg}, rgba(5,20,36,0.8))`, position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '16px' }}>
                  <div style={{ fontSize: '80px', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-60%)', opacity: 0.2 }}>🌆</div>
                  <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'white', marginBottom: '4px' }}>
                      <span style={{ color: r.btnColor }}>📍</span>
                      <span style={{ fontWeight: 700 }}>{r.label}</span>
                    </div>
                    <span className="text-label-mono" style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>{r.regionCode}</span>
                  </div>
                  <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                    <span className="chip" style={{ background: r.badge.bg, color: r.badge.color, border: `1px solid ${r.badge.border}`, fontSize: '10px' }}>{r.badge.text}</span>
                    <span className="chip" style={{ background: r.confBg, color: r.confColor, border: `1px solid ${r.confColor}33`, fontSize: '10px' }}>{r.confidence} CONFIDENCE</span>
                  </div>
                </div>

                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '8px', borderLeft: `3px solid ${r.accentBorder}`, marginBottom: '12px' }}>
                    <p className="text-label-mono" style={{ color: r.confColor, fontSize: '10px', marginBottom: '4px' }}>ADJUSTMENT PROFILE</p>
                    <p style={{ fontSize: '13px' }}>{r.adjustment}</p>
                  </div>
                  <p className="text-body-sm" style={{ color: 'var(--text-secondary)', fontStyle: 'italic', flex: 1, marginBottom: '16px' }}>{r.insight}</p>
                  <button onClick={() => applyVariant(r.key)} className="btn" style={{ width: '100%', padding: '10px', border: `1px solid ${r.btnColor}33`, color: r.btnColor, background: 'rgba(255,255,255,0.03)' }}>Select {r.key === 'hanoi' ? 'HN' : r.key === 'danang' ? 'DN' : 'HCM'} Variant</button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
