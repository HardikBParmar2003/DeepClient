import React, { useState, useEffect } from 'react';
import CustomPagination from '../../components/shared/CustomPagination';
import api from '../../services/api';
import { HiPlus, HiTrash, HiSave, HiOutlineDocumentText, HiOutlinePencilAlt, HiOutlineViewGridAdd, HiOutlineEye, HiDownload, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';
import CustomSelect from '../../components/shared/CustomSelect';

const generateId = (prefix) => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

export default function AdminMatrixBuilder() {
  const [matrices, setMatrices] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [currentMatrix, setCurrentMatrix] = useState({
    name: '',
    brand: 'FRX',
    matrix_data: { columns: [], rows: [] },
    footer_text: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAllPreview, setShowAllPreview] = useState(false);

  useEffect(() => {
    fetchMatrices();
  }, []);

  const fetchMatrices = async () => {
    try {
      const { data } = await api.get('/matrices');
      setMatrices(data);
    } catch (error) {
      console.error('Failed to fetch matrices', error);
    }
  };

  const saveMatrix = async () => {
    if (!currentMatrix.name) {
      return toast.error('Please provide a Matrix Category Name before saving (e.g. BIFOCALS)');
    }
    
    setLoading(true);
    try {
      if (currentMatrix.id) {
        await api.put(`/matrices/${currentMatrix.id}`, currentMatrix);
      } else {
        await api.post('/matrices', currentMatrix);
      }
      fetchMatrices();
      toast.success('Matrix structure saved successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save matrix. Please ensure you are logged in and try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createNewMatrix = () => {
    setCurrentMatrix({
      name: '',
      brand: 'FRX',
      matrix_data: { columns: [], rows: [] },
      footer_text: ''
    });
  };

  // --- COLUMN MANAGEMENT ---
  const addMainColumn = () => {
    const newCol = { id: generateId('c'), name: 'NEW CATEGORY', children: [] };
    setCurrentMatrix(prev => ({
      ...prev,
      matrix_data: { ...prev.matrix_data, columns: [...prev.matrix_data.columns, newCol] }
    }));
  };

  const addSubColumn = (parentId) => {
    setCurrentMatrix(prev => ({
      ...prev,
      matrix_data: {
        ...prev.matrix_data,
        columns: prev.matrix_data.columns.map(col => {
          if (col.id === parentId) {
            return { ...col, children: [...(col.children || []), { id: generateId('sc'), name: 'NEW COATING', children: [] }] };
          }
          return col;
        })
      }
    }));
  };

  const updateColumnName = (colId, newName, isSub = false, parentId = null) => {
    setCurrentMatrix(prev => {
      const newCols = prev.matrix_data.columns.map(col => {
        if (!isSub && col.id === colId) return { ...col, name: newName };
        if (isSub && col.id === parentId) {
          return {
            ...col,
            children: col.children.map(sub => sub.id === colId ? { ...sub, name: newName } : sub)
          };
        }
        return col;
      });
      return { ...prev, matrix_data: { ...prev.matrix_data, columns: newCols } };
    });
  };

  const deleteColumn = (id, isSub = false, parentId = null) => {
    let newCols;
    let deletedId = id;

    if (!isSub) {
      newCols = currentMatrix.matrix_data.columns.filter(c => c.id !== id);
    } else {
      newCols = currentMatrix.matrix_data.columns.map(col => {
        if (col.id === parentId) {
          return { ...col, children: col.children.filter(sub => sub.id !== id) };
        }
        return col;
      });
    }

    // Identify active leaf node IDs so we can clean up prices
    const activeLeafIds = [];
    newCols.forEach(c => {
      if (!c.children || c.children.length === 0) activeLeafIds.push(c.id);
      else c.children.forEach(sub => activeLeafIds.push(sub.id));
    });

    const newRows = currentMatrix.matrix_data.rows.map(row => {
      const cleanedPrices = {};
      Object.keys(row.prices || {}).forEach(key => {
        if (activeLeafIds.includes(key)) cleanedPrices[key] = row.prices[key];
      });
      return { ...row, prices: cleanedPrices };
    });

    setCurrentMatrix(prev => ({
      ...prev,
      matrix_data: { columns: newCols, rows: newRows }
    }));
  };


  // --- ROW MANAGEMENT ---
  const addRow = () => {
    const newRow = { id: generateId('row'), description: '', powerRange: '', prices: {} };
    setCurrentMatrix(prev => ({
      ...prev,
      matrix_data: { ...prev.matrix_data, rows: [...prev.matrix_data.rows, newRow] }
    }));
  };

  const deleteRow = (rowId) => {
    setCurrentMatrix(prev => ({
      ...prev,
      matrix_data: { ...prev.matrix_data, rows: prev.matrix_data.rows.filter(r => r.id !== rowId) }
    }));
  };

  const updateRowData = (rowId, field, value) => {
    setCurrentMatrix(prev => ({
      ...prev,
      matrix_data: {
        ...prev.matrix_data,
        rows: prev.matrix_data.rows.map(r => r.id === rowId ? { ...r, [field]: value } : r)
      }
    }));
  };

  const updatePrice = (rowId, colId, value) => {
    setCurrentMatrix(prev => ({
      ...prev,
      matrix_data: {
        ...prev.matrix_data,
        rows: prev.matrix_data.rows.map(r => {
          if (r.id === rowId) {
            const numVal = isNaN(Number(value)) ? value : Number(value);
            return { ...r, prices: { ...r.prices, [colId]: numVal } };
          }
          return r;
        })
      }
    }));
  };


  const downloadPDF = () => {
    const table = document.getElementById('matrix-preview-table-container');
    if (!table) return;
    
    // Save original styles
    const originalStyle = table.style.cssText;
    
    // Temporarily force max width so html2canvas captures everything without clipping
    table.style.width = 'max-content';
    table.style.maxWidth = 'none';

    toast.loading('Generating PDF...', { id: 'pdf-toast' });

    toCanvas(table, { pixelRatio: 2 }).then((canvas) => {
      // Restore styles
      table.style.cssText = originalStyle;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape for tables
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let finalHeight = pdfHeight;
      if (pdfHeight > pdf.internal.pageSize.getHeight()) {
         finalHeight = pdf.internal.pageSize.getHeight();
      }

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, finalHeight);
      pdf.save(`${currentMatrix.name || 'Matrix_Pricing'}.pdf`);
      
      toast.success('PDF Downloaded!', { id: 'pdf-toast' });
    }).catch(err => {
      console.error(err);
      table.style.cssText = originalStyle;
      toast.error('Failed to generate PDF.', { id: 'pdf-toast' });
    });
  };

  const downloadAllPDF = async () => {
    toast.loading('Generating Full Catalog PDF (this may take a moment)...', { id: 'pdf-all' });
    try {
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      let currentY = margin;
      
      for (let i = 0; i < matrices.length; i++) {
        const tableDiv = document.getElementById(`matrix-preview-${matrices[i].id}`);
        if (!tableDiv) continue;
        
        const originalStyle = tableDiv.style.cssText;
        tableDiv.style.width = 'max-content';
        tableDiv.style.maxWidth = 'none';
        
        const canvas = await toCanvas(tableDiv, { pixelRatio: 2 });
        tableDiv.style.cssText = originalStyle;
        
        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        let pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        if (pdfHeight > pageHeight - (2 * margin)) {
           pdfHeight = pageHeight - (2 * margin);
        }
        
        if (currentY + pdfHeight > pageHeight - margin && i > 0) {
          pdf.addPage();
          currentY = margin;
        }
        
        pdf.addImage(imgData, 'PNG', 0, currentY, pdfWidth, pdfHeight);
        currentY += pdfHeight + margin;
      }
      
      pdf.save('Full_Pricing_Catalog.pdf');
      toast.success('Catalog PDF Downloaded!', { id: 'pdf-all' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate full catalog PDF.', { id: 'pdf-all' });
    }
  };

  // --- HELPER TO GET ACTIVE LEAF COLUMNS FOR TABLE ---
  const getRenderColumns = () => {
    return getColumnsForMatrix(currentMatrix);
  };

  const getColumnsForMatrix = (matrix) => {
    const cols = [];
    if (!matrix?.matrix_data?.columns) return cols;
    matrix.matrix_data.columns.forEach(main => {
      if (!main.children || main.children.length === 0) {
        cols.push({ ...main, isMain: true, parentId: null });
      } else {
        main.children.forEach(sub => {
          cols.push({ ...sub, isMain: false, parentId: main.id, parentName: main.name });
        });
      }
    });
    return cols;
  };

  const renderColumns = getRenderColumns();


  
  const totalPages = Math.ceil(matrices.length / limit);
  const paginatedMatrices = matrices.slice((page - 1) * limit, page * limit);




  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 text-[var(--text-primary)]">
      
      {/* Header Section */}
      <div className="relative z-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-xl glassmorphism">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-wide text-luxury-gold flex items-center gap-3">
              <HiOutlineViewGridAdd className="opacity-80" /> Pricing Matrix Builder
            </h1>
            <p className="text-[var(--text-secondary)] mt-2 text-base">Design spreadsheet-like pricing models dynamically.</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {matrices.length > 0 && (
            <button onClick={() => setShowAllPreview(true)} className="cursor-pointer flex items-center justify-center gap-2 bg-[var(--bg-card-hover)] border border-[var(--border-color)] text-luxury-gold hover:opacity-80 px-4 py-3 rounded-lg transition-all shadow-sm w-full sm:w-auto font-medium">
               <HiDownload size={18} /> Print Full Catalog
            </button>
          )}
          <CustomSelect
            options={paginatedMatrices.map(m => ({ label: `${m.brand} - ${m.name}`, value: m.id.toString() }))}
            value={currentMatrix.id?.toString() || ''}
            onChange={(e) => {
              const m = matrices.find(x => x.id.toString() === e.target.value);
              if (m) setCurrentMatrix(m);
            }}
            placeholder="Select an existing matrix..."
            className="w-full sm:w-80"
            searchable={false}
          />
          <button 
            onClick={createNewMatrix}
            className="w-full sm:w-auto px-6 py-3 border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-black font-semibold rounded-lg text-base whitespace-nowrap transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <HiPlus /> New Matrix
          </button>
        </div>
      </div>

      {/* BASIC INFO BAR */}
      <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-color)] shadow-xl glassmorphism flex flex-col xl:flex-row gap-5 items-end">
         <div className="w-full xl:w-1/4">
           <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Matrix Category Name</label>
           <input 
             type="text" 
             value={currentMatrix.name}
             onChange={e => setCurrentMatrix(prev => ({...prev, name: e.target.value}))}
             placeholder="e.g. CLEAR STANDARD" 
             className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-3 rounded-lg focus:border-luxury-gold outline-none transition-colors text-base"
           />
         </div>
         <div className="w-full xl:w-1/4">
           <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Brand Identifier</label>
           <input 
             type="text" 
             value={currentMatrix.brand}
             onChange={e => setCurrentMatrix(prev => ({...prev, brand: e.target.value}))}
             placeholder="e.g. FRX"
             className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-3 rounded-lg focus:border-luxury-gold outline-none transition-colors text-base"
           />
         </div>
         <div className="w-full xl:w-1/3">
           <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Footer Note</label>
           <input 
             type="text"
             value={currentMatrix.footer_text || ''}
             onChange={e => setCurrentMatrix(prev => ({...prev, footer_text: e.target.value}))}
             placeholder="e.g. Add : +1.00 to +3.00 | Dia : 65mm" 
             className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-3 rounded-lg focus:border-luxury-gold outline-none transition-colors text-base"
           />
         </div>
         <div className="w-full xl:flex-1">
           <button 
             onClick={saveMatrix}
             disabled={loading}
             className="w-full flex items-center justify-center gap-2 bg-luxury-gold text-[var(--bg-primary)] font-bold py-3 px-4 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-luxury-gold/20 text-lg whitespace-nowrap cursor-pointer"
           >
             <HiSave className="text-xl" /> {loading ? 'Saving...' : 'Save Matrix'}
           </button>
         </div>
      </div>

      {/* SPREADSHEET BUILDER (FULL WIDTH) */}
      <div className="w-full space-y-6">
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-xl glassmorphism overflow-hidden flex flex-col h-full">
          
          {/* Table Action Bar */}
          <div className="p-4 border-b border-[var(--border-color)] flex flex-wrap gap-3 items-center justify-between bg-[var(--bg-card-hover)]/30">
             <div className="flex gap-2">
               <button onClick={addMainColumn} className="flex items-center gap-1 text-base font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:border-blue-500/50 px-4 py-2 rounded-lg transition-all cursor-pointer">
                 <HiPlus /> Add Category Column
               </button>
               <button onClick={addRow} className="flex items-center gap-1 text-base font-medium bg-green-500/10 text-green-400 border border-green-500/20 hover:border-green-500/50 px-4 py-2 rounded-lg transition-all cursor-pointer">
                 <HiPlus /> Add Lens Row
               </button>
             </div>
             <div className="flex items-center gap-3">
               {currentMatrix.name && <span className="text-xl font-semibold text-luxury-gold opacity-80 px-2 uppercase tracking-wide">{currentMatrix.name} Editor</span>}
               <button onClick={() => setShowPreview(true)} className="cursor-pointer flex items-center gap-2 bg-luxury-gold text-[var(--bg-primary)] px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-all shadow-md">
                 <HiOutlineEye size={18} /> Preview & Print
               </button>
             </div>
          </div>

          {/* The Actual Matrix Wrapper (Scrollable) */}
          <div className="overflow-x-auto w-full p-6">
            
            {/* Columns Editor Hierarchy (Visual representation above the table) */}
            <div className="flex gap-4 mb-6 pb-6 border-b border-[var(--border-color)] overflow-x-auto">
               {currentMatrix.matrix_data.columns.length === 0 ? (
                  <div className="text-[var(--text-muted)] italic text-base py-2">Click "Add Category Column" to start building your pricing columns.</div>
               ) : (
                  currentMatrix.matrix_data.columns.map(mainCol => (
                    <div key={mainCol.id} className="min-w-[220px] flex-shrink-0 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 shadow-sm relative group">
                      
                      {/* Main Column Input */}
                      <div className="flex items-center gap-2 mb-4">
                         <div className="w-2.5 h-2.5 rounded-full bg-luxury-gold shadow-[0_0_8px_var(--color-luxury-gold)]" />
                         <input 
                           type="text" 
                           value={mainCol.name}
                           onChange={(e) => updateColumnName(mainCol.id, e.target.value)}
                           className="bg-transparent border-b border-transparent hover:border-luxury-gold/50 focus:border-luxury-gold outline-none w-full font-semibold uppercase text-lg text-[var(--text-primary)]"
                           placeholder="CATEGORY NAME"
                         />
                         <button onClick={() => deleteColumn(mainCol.id)} className="cursor-pointer text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-500/10 rounded"><HiTrash /></button>
                      </div>

                      {/* Sub Columns List */}
                      <div className="pl-5 border-l-2 border-luxury-gold/20 space-y-3">
                         {(mainCol.children || []).map(subCol => (
                           <div key={subCol.id} className="flex items-center gap-2 group/sub relative">
                              <span className="absolute -left-[22px] top-1/2 w-5 border-t-2 border-luxury-gold/20"></span>
                              <input 
                                type="text"
                                value={subCol.name}
                                onChange={(e) => updateColumnName(subCol.id, e.target.value, true, mainCol.id)}
                                className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-1.5 text-base font-medium w-full outline-none focus:border-luxury-gold text-[var(--text-primary)] uppercase"
                                placeholder="SUB-COATING"
                              />
                              <button onClick={() => deleteColumn(subCol.id, true, mainCol.id)} className="cursor-pointer text-red-400 opacity-0 group-hover/sub:opacity-100 transition-opacity"><HiTrash size={16}/></button>
                           </div>
                         ))}
                         <button onClick={() => addSubColumn(mainCol.id)} className="cursor-pointer text-sm font-medium text-luxury-gold/80 hover:text-luxury-gold flex items-center gap-1 mt-3 transition-colors">
                           <HiPlus size={16}/> Add nested coating
                         </button>
                      </div>
                    </div>
                  ))
               )}
            </div>

            {/* The Spreadsheet Table */}
            <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-lg">
              <table className="w-full text-left border-collapse text-base">
                <thead className="bg-[var(--bg-card-hover)]/50">
                  <tr>
                    <th rowSpan={2} className="p-4 border-b border-r border-[var(--border-color)] font-semibold text-[var(--text-primary)] min-w-[200px] text-lg uppercase tracking-wide">DESCRIPTION</th>
                    <th rowSpan={2} className="p-4 border-b border-r border-[var(--border-color)] font-semibold text-[var(--text-primary)] min-w-[150px] text-lg uppercase tracking-wide">POWER RANGE</th>
                    
                    {currentMatrix.matrix_data.columns.map((col, idx) => (
                      <th 
                        key={col.id} 
                        colSpan={col.children?.length > 0 ? col.children.length : 1}
                        rowSpan={col.children?.length > 0 ? 1 : 2}
                        className={`p-3 border-b border-[var(--border-color)] font-semibold text-center min-w-[120px] text-lg uppercase tracking-wide text-luxury-gold ${idx !== currentMatrix.matrix_data.columns.length -1 || col.children?.length > 0 ? 'border-r' : ''}`}
                      >
                        {col.name || 'UNNAMED'}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    {currentMatrix.matrix_data.columns.flatMap((col, mainIdx) => {
                      if (col.children && col.children.length > 0) {
                        return col.children.map((sub, subIdx) => (
                          <th 
                            key={sub.id} 
                            className={`p-2 border-b border-[var(--border-color)] font-medium text-center text-base text-[var(--text-secondary)] uppercase tracking-wide whitespace-nowrap min-w-[90px] ${(mainIdx !== currentMatrix.matrix_data.columns.length - 1) || (subIdx !== col.children.length - 1) ? 'border-r' : ''}`}
                          >
                            {sub.name || 'UNNAMED'}
                          </th>
                        ));
                      }
                      return [];
                    })}
                  </tr>
                </thead>
                <tbody>
                  {currentMatrix.matrix_data.rows.length === 0 ? (
                    <tr>
                      <td colSpan={renderColumns.length + 2} className="p-8 text-center text-[var(--text-muted)] text-lg">
                        No rows added yet. Build your matrix columns above and click "Add Lens Row".
                      </td>
                    </tr>
                  ) : (
                    currentMatrix.matrix_data.rows.map(row => (
                      <tr key={row.id} className="hover:bg-[var(--bg-card-hover)] transition-colors group cursor-pointer" onClick={(e) => { if(e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('select')) return; const editBtn = e.currentTarget.querySelector('button[title="View"]') || e.currentTarget.querySelector('button[title="View Details"]') || e.currentTarget.querySelector('button[title="Edit"]') || e.currentTarget.querySelector('button[title="Edit Name"]'); if(editBtn) editBtn.click(); }}>
                        
                        {/* Lens Description Cell */}
                        <td className="p-3 border-b border-r border-[var(--border-color)] relative">
                          <input 
                             type="text" 
                             value={row.description} 
                             onChange={e => updateRowData(row.id, 'description', e.target.value)}
                             placeholder="e.g. Standard 1.56"
                             className="w-full bg-transparent border border-transparent hover:border-[var(--border-color)] focus:border-luxury-gold rounded px-2 py-2 outline-none transition-colors text-base font-medium"
                          />
                          <button onClick={() => deleteRow(row.id)} className="cursor-pointer absolute left-[-35px] top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover:opacity-100 bg-red-500/10 p-1.5 rounded transition-all">
                            <HiTrash size={16} />
                          </button>
                        </td>
                        
                        {/* Power Range Cell */}
                        <td className="p-3 border-b border-r border-[var(--border-color)]">
                           <input 
                             type="text" 
                             value={row.powerRange} 
                             onChange={e => updateRowData(row.id, 'powerRange', e.target.value)}
                             placeholder="e.g. -6.00 TO +4.00"
                             className="w-full bg-transparent border border-transparent hover:border-[var(--border-color)] focus:border-luxury-gold rounded px-2 py-2 outline-none transition-colors text-base"
                          />
                        </td>

                        {/* Dynamic Price Cells */}
                        {renderColumns.map((col, idx) => (
                           <td key={col.id} className={`p-2 border-b border-[var(--border-color)] ${idx !== renderColumns.length -1 ? 'border-r' : ''}`}>
                             <div className="relative">
                                <input 
                                  type="text" 
                                  value={row.prices[col.id] ?? ''} 
                                  onChange={e => updatePrice(row.id, col.id, e.target.value)}
                                  placeholder="NA"
                                  className="w-full bg-[var(--bg-input)] border border-transparent hover:border-[var(--border-color)] focus:border-luxury-gold rounded px-2 py-2 outline-none transition-colors text-center text-base font-medium min-w-[80px]"
                                />
                             </div>
                           </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

      <CustomPagination 
        page={page} 
        totalPages={totalPages} 
        setPage={setPage} 
        limit={limit} 
        setLimit={setLimit} 
      />

        </div>
      </div>

      {/* PREVIEW & DOWNLOAD MODAL */}
      {showPreview && (
        <div className="fixed inset-0 bg-[var(--bg-primary)]/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-[95vw] h-[90vh] bg-[var(--bg-card)] rounded-2xl border border-luxury-gold/50 shadow-2xl flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] bg-[var(--bg-card-hover)]/30">
              <div>
                <h2 className="text-3xl font-bold text-luxury-gold uppercase tracking-wider">{currentMatrix.brand} - {currentMatrix.name}</h2>
                <p className="text-[var(--text-secondary)] mt-1">Full-screen preview. Review data before printing.</p>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={downloadPDF} className="flex items-center gap-2 bg-luxury-gold text-[var(--bg-primary)] font-bold px-6 py-3 rounded-xl hover:opacity-90 shadow-lg shadow-luxury-gold/20 transition-all text-lg cursor-pointer">
                  <HiDownload size={24} /> Download PDF
                </button>
                <button onClick={() => setShowPreview(false)} className="cursor-pointer text-[var(--text-secondary)] hover:text-red-400 p-2 bg-[var(--bg-primary)] rounded-full border border-[var(--border-color)] transition-colors">
                  <HiX size={28} />
                </button>
              </div>
            </div>

            {/* Modal Content / Table Preview */}
            <div className="flex-1 overflow-auto p-8 bg-[var(--bg-primary)]">
               <div id="matrix-preview-table-container" className="inline-block min-w-full bg-white p-8 rounded-xl shadow">
                  <div className="text-center mb-6">
                     <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-widest">{currentMatrix.brand} - {currentMatrix.name}</h1>
                     <p className="text-gray-500 font-medium">Pricing Matrix</p>
                  </div>
                  
                  <table className="w-full text-left border-collapse border border-gray-400 text-gray-900 text-lg">
                    <thead className="bg-gray-100">
                      <tr>
                        <th rowSpan={2} className="p-4 border border-gray-400 font-bold min-w-[250px] uppercase">DESCRIPTION</th>
                        <th rowSpan={2} className="p-4 border border-gray-400 font-bold min-w-[200px] uppercase">POWER RANGE</th>
                        {currentMatrix.matrix_data.columns.map((col, idx) => (
                          <th 
                            key={col.id} 
                            colSpan={col.children?.length > 0 ? col.children.length : 1}
                            rowSpan={col.children?.length > 0 ? 1 : 2}
                            className={`p-3 border border-gray-400 font-bold text-center uppercase tracking-wide bg-gray-200`}
                          >
                            {col.name || 'UNNAMED'}
                          </th>
                        ))}
                      </tr>
                      <tr>
                        {currentMatrix.matrix_data.columns.flatMap((col) => {
                          if (col.children && col.children.length > 0) {
                            return col.children.map((sub) => (
                              <th key={sub.id} className={`p-3 border border-gray-400 font-semibold text-center uppercase tracking-wide bg-gray-50 whitespace-nowrap min-w-[90px]`}>
                                {sub.name || 'UNNAMED'}
                              </th>
                            ));
                          }
                          return [];
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {currentMatrix.matrix_data.rows.length === 0 ? (
                        <tr>
                          <td colSpan={renderColumns.length + 2} className="p-8 text-center text-gray-500">No rows available.</td>
                        </tr>
                      ) : (
                        currentMatrix.matrix_data.rows.map(row => (
                          <tr key={row.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={(e) => { if(e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('select')) return; const editBtn = e.currentTarget.querySelector('button[title="View"]') || e.currentTarget.querySelector('button[title="View Details"]') || e.currentTarget.querySelector('button[title="Edit"]') || e.currentTarget.querySelector('button[title="Edit Name"]'); if(editBtn) editBtn.click(); }}>
                            <td className="p-4 border border-gray-400 font-semibold">{row.description}</td>
                            <td className="p-4 border border-gray-400">{row.powerRange}</td>
                            {renderColumns.map((col) => (
                               <td key={col.id} className={`p-4 border border-gray-400 text-center font-medium min-w-[80px]`}>
                                 {row.prices[col.id] || 'NA'}
                               </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {currentMatrix.footer_text && (
                    <div className="mt-8 text-gray-700 italic border-l-4 border-gray-400 pl-4 py-2">
                       {currentMatrix.footer_text}
                    </div>
                  )}
               </div>
            </div>

          </div>
        </div>
      )}

      {/* FULL CATALOG PREVIEW MODAL */}
      {showAllPreview && (
        <div className="fixed inset-0 bg-[var(--bg-primary)]/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-[95vw] h-[90vh] bg-[var(--bg-card)] rounded-2xl border border-luxury-gold/50 shadow-2xl flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] bg-[var(--bg-card-hover)]/30">
              <div>
                <h2 className="text-3xl font-bold text-luxury-gold uppercase tracking-wider">Full Pricing Catalog</h2>
                <p className="text-[var(--text-secondary)] mt-1">Review all {matrices.length} matrices before printing.</p>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={downloadAllPDF} className="flex items-center gap-2 bg-luxury-gold text-[var(--bg-primary)] font-bold px-6 py-3 rounded-xl hover:opacity-90 shadow-lg shadow-luxury-gold/20 transition-all text-lg cursor-pointer">
                  <HiDownload size={24} /> Download All (PDF)
                </button>
                <button onClick={() => setShowAllPreview(false)} className="cursor-pointer text-[var(--text-secondary)] hover:text-red-400 p-2 bg-[var(--bg-primary)] rounded-full border border-[var(--border-color)] transition-colors">
                  <HiX size={28} />
                </button>
              </div>
            </div>

            {/* Modal Content / All Tables */}
            <div className="flex-1 overflow-auto p-8 bg-[var(--bg-primary)] flex flex-col gap-12">
               {paginatedMatrices.map((matrix, index) => {
    const serialNumber = (page - 1) * limit + index + 1;

                 const mRenderCols = getColumnsForMatrix(matrix);
                 
                 const isEven = index % 2 === 1; // index 1 is the 2nd table
                 const headerBg = isEven ? 'bg-red-300' : 'bg-green-300';
                 const subHeaderBg = isEven ? 'bg-red-200' : 'bg-green-200';
                 const rowOddBg = isEven ? 'bg-red-50' : 'bg-green-50';
                 const rowEvenBg = isEven ? 'bg-red-100' : 'bg-green-100';
                 const titleColor = isEven ? 'text-red-600' : 'text-green-600';
                 const borderColor = 'border-gray-500';

                 
  const totalPages = Math.ceil(matrices.length / limit);
  const paginatedMatrices = matrices.slice((page - 1) * limit, page * limit);



                 return (
                   <div key={matrix.id} id={`matrix-preview-${matrix.id}`} className="inline-block min-w-full bg-white p-8 rounded-xl shadow border border-gray-200">
                      <div className="flex justify-between items-end mb-4 border-b-2 border-gray-200 pb-2">
                         <h2 className="text-2xl font-bold text-red-600 uppercase tracking-wider">{matrix.brand}</h2>
                         <h1 className={`text-2xl font-bold uppercase tracking-widest ${titleColor}`}>{matrix.name}</h1>
                         <div className="w-16"></div> {/* Spacer for balance */}
                      </div>
                      
                      <table className={`w-full text-left border-collapse border ${borderColor} text-gray-900 text-lg`}>
                        <thead className={headerBg}>
                          <tr>
                            <th rowSpan={2} className={`p-4 border ${borderColor} font-bold min-w-[250px] uppercase text-black`}>DESCRIPTION</th>
                            <th rowSpan={2} className={`p-4 border ${borderColor} font-bold min-w-[200px] uppercase text-black`}>POWER RANGE</th>
                            {matrix.matrix_data.columns.map((col) => (
                              <th 
                                key={col.id} 
                                colSpan={col.children?.length > 0 ? col.children.length : 1}
                                rowSpan={col.children?.length > 0 ? 1 : 2}
                                className={`p-3 border ${borderColor} font-bold text-center uppercase tracking-wide text-black`}
                              >
                                {col.name || 'UNNAMED'}
                              </th>
                            ))}
                          </tr>
                          <tr className={subHeaderBg}>
                            {matrix.matrix_data.columns.flatMap((col) => {
                              if (col.children && col.children.length > 0) {
                                return col.children.map((sub) => (
                                  <th key={sub.id} className={`p-3 border ${borderColor} font-semibold text-center uppercase tracking-wide whitespace-nowrap min-w-[90px] text-black`}>
                                    {sub.name || 'UNNAMED'}
                                  </th>
                                ));
                              }
                              return [];
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {matrix.matrix_data.rows.length === 0 ? (
                            <tr>
                              <td colSpan={mRenderCols.length + 2} className="p-8 text-center text-gray-500">No rows available.</td>
                            </tr>
                          ) : (
                            matrix.matrix_data.rows.map((row, rIdx) => (
                              <tr className="hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer" key={row.id} className={`${rIdx % 2 === 0 ? rowOddBg : rowEvenBg} transition-colors`} onClick={(e) => { if(e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('select')) return; const editBtn = e.currentTarget.querySelector('button[title="View"]') || e.currentTarget.querySelector('button[title="View Details"]') || e.currentTarget.querySelector('button[title="Edit"]') || e.currentTarget.querySelector('button[title="Edit Name"]'); if(editBtn) editBtn.click(); }}>
                                <td className={`p-4 border ${borderColor} font-semibold text-black`}>{row.description}</td>
                                <td className={`p-4 border ${borderColor} text-black`}>{row.powerRange}</td>
                                {mRenderCols.map((col) => (
                                   <td key={col.id} className={`p-4 border ${borderColor} text-center font-medium min-w-[80px] text-black`}>
                                     {row.prices[col.id] || 'NA'}
                                   </td>
                                ))}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>

                      {matrix.footer_text && (
                        <div className="mt-6 text-gray-800 italic text-base">
                           <span className="font-semibold">{matrix.brand}</span> - {matrix.footer_text}
                        </div>
                      )}
                   </div>
                 );
               })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
