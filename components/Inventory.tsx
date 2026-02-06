import React, { useState } from 'react';
import { Product } from '../types';
import { Search, Plus, Package, AlertTriangle } from 'lucide-react';

interface InventoryProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const Inventory: React.FC<InventoryProps> = ({ products, setProducts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    category: 'Destilado',
    unit: 'un'
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.currentStock || !newProduct.costPrice) return;
    
    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      category: newProduct.category as any,
      currentStock: Number(newProduct.currentStock),
      unit: newProduct.unit as any,
      costPrice: Number(newProduct.costPrice),
      supplier: newProduct.supplier || ''
    };

    setProducts([...products, product]);
    setIsModalOpen(false);
    setNewProduct({ category: 'Destilado', unit: 'un' });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">Estoque & Insumos</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Novo Produto
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar produto..." 
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-600 font-medium">
            <tr>
              <th className="p-4">Produto</th>
              <th className="p-4">Categoria</th>
              <th className="p-4">Estoque Atual</th>
              <th className="p-4">Custo Unit.</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map(product => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium text-slate-800">{product.name}</td>
                <td className="p-4 text-slate-500">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs">{product.category}</span>
                </td>
                <td className="p-4 text-slate-700 font-semibold">
                    {product.currentStock} <span className="text-sm font-normal text-slate-400">{product.unit}</span>
                </td>
                <td className="p-4 text-slate-600">R$ {product.costPrice.toFixed(2)}</td>
                <td className="p-4">
                  {product.currentStock < 10 ? (
                    <span className="flex items-center text-amber-600 text-sm font-medium">
                      <AlertTriangle size={16} className="mr-1" /> Baixo
                    </span>
                  ) : (
                    <span className="flex items-center text-green-600 text-sm font-medium">
                      <Package size={16} className="mr-1" /> OK
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
            <div className="p-8 text-center text-slate-400">Nenhum produto encontrado.</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Adicionar Produto</h3>
            <div className="space-y-4">
              <input 
                className="w-full p-2 border rounded" 
                placeholder="Nome do Produto"
                value={newProduct.name || ''}
                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <select 
                    className="p-2 border rounded"
                    value={newProduct.category}
                    onChange={e => setNewProduct({...newProduct, category: e.target.value as any})}
                >
                    <option value="Destilado">Destilado</option>
                    <option value="Fermentado">Fermentado</option>
                    <option value="Não Alcoólico">Não Alcoólico</option>
                    <option value="Insumo">Insumo</option>
                    <option value="Utensílio">Utensílio</option>
                </select>
                <select 
                    className="p-2 border rounded"
                    value={newProduct.unit}
                    onChange={e => setNewProduct({...newProduct, unit: e.target.value as any})}
                >
                    <option value="un">Unidade</option>
                    <option value="L">Litro</option>
                    <option value="kg">Kg</option>
                    <option value="cx">Caixa</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input 
                    type="number" 
                    className="w-full p-2 border rounded" 
                    placeholder="Quantidade Inicial"
                    value={newProduct.currentStock || ''}
                    onChange={e => setNewProduct({...newProduct, currentStock: Number(e.target.value)})}
                />
                <input 
                    type="number" 
                    className="w-full p-2 border rounded" 
                    placeholder="Preço de Custo (R$)"
                    value={newProduct.costPrice || ''}
                    onChange={e => setNewProduct({...newProduct, costPrice: Number(e.target.value)})}
                />
              </div>
              <input 
                className="w-full p-2 border rounded" 
                placeholder="Fornecedor (Opcional)"
                value={newProduct.supplier || ''}
                onChange={e => setNewProduct({...newProduct, supplier: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancelar</button>
              <button onClick={handleAddProduct} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;