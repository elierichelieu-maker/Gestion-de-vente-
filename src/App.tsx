import React, { useState, useEffect } from 'react';
import { Product, Seller, Sale, StockMovement, Customer, AppSettings, ActiveTab, ExchangeRateConfig, ExchangeTransaction } from './types';
import {
  INITIAL_PRODUCTS,
  INITIAL_SELLERS,
  generateInitialSales,
  INITIAL_MOVEMENTS,
  INITIAL_CUSTOMERS,
  DEFAULT_SETTINGS,
  DEFAULT_EXCHANGE_RATES,
  INITIAL_EXCHANGE_TRANSACTIONS,
} from './data/mockData';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';

// Dynamic lazy imports for high-performance mobile reload and reduced bundle size
const StockManagementView = React.lazy(() =>
  import('./components/stocks/StockManagementView').then((m) => ({ default: m.StockManagementView }))
);
const CustomersManagementView = React.lazy(() =>
  import('./components/customers/CustomersManagementView').then((m) => ({ default: m.CustomersManagementView }))
);
const SalesHistoryView = React.lazy(() =>
  import('./components/sales/SalesHistoryView').then((m) => ({ default: m.SalesHistoryView }))
);
const InvoicesManagementView = React.lazy(() =>
  import('./components/invoices/InvoicesManagementView').then((m) => ({ default: m.InvoicesManagementView }))
);
const CurrencyExchangeView = React.lazy(() =>
  import('./components/currency/CurrencyExchangeView').then((m) => ({ default: m.CurrencyExchangeView }))
);
const FinancialReportsView = React.lazy(() =>
  import('./components/reports/FinancialReportsView').then((m) => ({ default: m.FinancialReportsView }))
);
const UsersManagementView = React.lazy(() =>
  import('./components/users/UsersManagementView').then((m) => ({ default: m.UsersManagementView }))
);
const SettingsManagementView = React.lazy(() =>
  import('./components/settings/SettingsManagementView').then((m) => ({ default: m.SettingsManagementView }))
);
const NewSaleModal = React.lazy(() =>
  import('./components/sales/NewSaleModal').then((m) => ({ default: m.NewSaleModal }))
);
const InvoiceReceiptModal = React.lazy(() =>
  import('./components/invoices/InvoiceReceiptModal').then((m) => ({ default: m.InvoiceReceiptModal }))
);
const MobileDeploymentGuideModal = React.lazy(() =>
  import('./components/mobile/MobileDeploymentGuideModal').then((m) => ({ default: m.MobileDeploymentGuideModal }))
);
const ShareAppModal = React.lazy(() =>
  import('./components/common/ShareAppModal').then((m) => ({ default: m.ShareAppModal }))
);
import { PWAInstallButton } from './components/common/PWAInstallButton';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  FileSpreadsheet,
  Settings,
  PlusCircle,
  Wine,
  UserCog,
  ArrowLeftRight,
  FileText,
  Smartphone,
  Cloud,
  RefreshCw,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import {
  seedInitialDataIfEmpty,
  subscribeToProducts,
  subscribeToSellers,
  subscribeToCustomers,
  subscribeToSales,
  subscribeToMovements,
  subscribeToSettings,
  subscribeToExchangeRates,
  subscribeToExchangeTransactions,
  syncSaveProduct,
  syncDeleteProduct,
  syncSaveSeller,
  syncDeleteSeller,
  syncSaveCustomer,
  syncSaveSale,
  syncSaveMovement,
  syncSaveSettings,
  syncSaveExchangeRates,
  syncSaveExchangeTransaction,
  syncDeleteExchangeTransaction,
  syncResetAllDataToDefault,
} from './services/cloudSyncService';
import { WaterBottleLogo } from './components/common/WaterBottleLogo';

const STORAGE_KEYS = {
  PRODUCTS: 'optiboissons_products_v2',
  SELLERS: 'optiboissons_sellers_v2',
  SALES: 'optiboissons_sales_v2',
  MOVEMENTS: 'optiboissons_movements_v2',
  CUSTOMERS: 'optiboissons_customers_v2',
  SETTINGS: 'optiboissons_settings_v2',
  EXCHANGE_RATES: 'optiboissons_exchange_rates_v1',
  EXCHANGE_TRANSACTIONS: 'optiboissons_exchange_transactions_v1',
};

function ViewLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[280px] py-12 text-center">
      <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-2.5" />
      <span className="text-xs text-slate-500 font-medium">Chargement...</span>
    </div>
  );
}

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [selectedSellerForSale, setSelectedSellerForSale] = useState<string | undefined>(undefined);
  const [selectedCustomerForSale, setSelectedCustomerForSale] = useState<{ name: string; company: string } | null>(null);
  const [isMobileGuideOpen, setIsMobileGuideOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [saleToPrint, setSaleToPrint] = useState<Sale | null>(null);

  // Core Data loaded from localStorage or seeded
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].category) {
          return parsed;
        }
      }
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [sellers, setSellers] = useState<Seller[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SELLERS);
      return stored ? JSON.parse(stored) : INITIAL_SELLERS;
    } catch {
      return INITIAL_SELLERS;
    }
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SALES);
      return stored ? JSON.parse(stored) : generateInitialSales();
    } catch {
      return generateInitialSales();
    }
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
      return stored ? JSON.parse(stored) : INITIAL_MOVEMENTS;
    } catch {
      return INITIAL_MOVEMENTS;
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return stored ? JSON.parse(stored) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.defaultTaxRate === 0.2 || parsed.defaultTaxRate === undefined)) {
          parsed.defaultTaxRate = 0.0;
        }
        return parsed;
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [exchangeRates, setExchangeRates] = useState<ExchangeRateConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EXCHANGE_RATES);
      return stored ? JSON.parse(stored) : DEFAULT_EXCHANGE_RATES;
    } catch {
      return DEFAULT_EXCHANGE_RATES;
    }
  });

  const [exchangeTransactions, setExchangeTransactions] = useState<ExchangeTransaction[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EXCHANGE_TRANSACTIONS);
      return stored ? JSON.parse(stored) : INITIAL_EXCHANGE_TRANSACTIONS;
    } catch {
      return INITIAL_EXCHANGE_TRANSACTIONS;
    }
  });

  // Persist state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SELLERS, JSON.stringify(sellers));
    } catch (e) {
      console.error(e);
    }
  }, [sellers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
    } catch (e) {
      console.error(e);
    }
  }, [sales]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
    } catch (e) {
      console.error(e);
    }
  }, [movements]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    } catch (e) {
      console.error(e);
    }
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXCHANGE_RATES, JSON.stringify(exchangeRates));
    } catch (e) {
      console.error(e);
    }
  }, [exchangeRates]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXCHANGE_TRANSACTIONS, JSON.stringify(exchangeTransactions));
    } catch (e) {
      console.error(e);
    }
  }, [exchangeTransactions]);

  // Real-time Cloud Synchronization across Computer, Phone, and Tablet
  const [isCloudConnected, setIsCloudConnected] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  useEffect(() => {
    // 1. Initial check & seed if Firestore database is fresh
    seedInitialDataIfEmpty();

    // 2. Real-time listeners for live multi-device synchronization
    const unsubProducts = subscribeToProducts((prods) => {
      setProducts(prods);
      setIsCloudConnected(true);
      setLastSyncTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    });

    const unsubSellers = subscribeToSellers((sels) => {
      setSellers(sels);
      setIsCloudConnected(true);
    });

    const unsubCustomers = subscribeToCustomers((custs) => {
      setCustomers(custs);
      setIsCloudConnected(true);
    });

    const unsubSales = subscribeToSales((sls) => {
      setSales(sls);
      setIsCloudConnected(true);
      setLastSyncTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    });

    const unsubMovements = subscribeToMovements((movs) => {
      setMovements(movs);
      setIsCloudConnected(true);
    });

    const unsubSettings = subscribeToSettings((sett) => {
      setSettings(sett);
      setIsCloudConnected(true);
    });

    const unsubRates = subscribeToExchangeRates((rates) => {
      setExchangeRates(rates);
      setIsCloudConnected(true);
    });

    const unsubTxs = subscribeToExchangeTransactions((txs) => {
      setExchangeTransactions(txs);
      setIsCloudConnected(true);
    });

    return () => {
      unsubProducts();
      unsubSellers();
      unsubCustomers();
      unsubSales();
      unsubMovements();
      unsubSettings();
      unsubRates();
      unsubTxs();
    };
  }, []);

  // Handler: Complete a new sale (deducts stock immediately & logs movement)
  const handleCompleteSale = (newSale: Sale) => {
    // 1. Add sale to top of sales list & push to cloud
    setSales((prev) => [newSale, ...prev]);
    syncSaveSale(newSale);

    // 2. Decrement stock for all items
    const newMovements: StockMovement[] = [];
    setProducts((prevProds) => {
      return prevProds.map((prod) => {
        const itemSold = newSale.items.find((it) => it.productId === prod.id);
        if (itemSold) {
          const prevStock = prod.stock;
          const nextStock = Math.max(0, prod.stock - itemSold.quantity);

          const mov: StockMovement = {
            id: `mov-${Date.now()}-${prod.id}`,
            productId: prod.id,
            productName: prod.name,
            type: 'out',
            quantity: itemSold.quantity,
            previousStock: prevStock,
            newStock: nextStock,
            reason: `Livraison ${newSale.invoiceNumber} (${newSale.customerName})`,
            date: new Date().toISOString(),
            operator: newSale.sellerName,
          };

          newMovements.push(mov);
          syncSaveMovement(mov);

          const updatedProd = {
            ...prod,
            stock: nextStock,
            updatedAt: new Date().toISOString(),
          };
          syncSaveProduct(updatedProd);

          return updatedProd;
        }
        return prod;
      });
    });

    // 3. Append movements
    if (newMovements.length > 0) {
      setMovements((prev) => [...newMovements, ...prev]);
    }

    // 4. Update customer accumulated stats if existing
    setCustomers((prevCusts) => {
      return prevCusts.map((c) => {
        const matchCompany =
          newSale.customerCompany &&
          c.company.toLowerCase().trim() === newSale.customerCompany.toLowerCase().trim();
        const matchName =
          c.name.toLowerCase().trim() === newSale.customerName.toLowerCase().trim();

        if (matchCompany || matchName) {
          // Count consigned items (kegs/crates)
          const kegsCount = newSale.items.reduce((sum, it) => {
            const prod = products.find((p) => p.id === it.productId);
            return sum + (prod?.isConsigne ? it.quantity : 0);
          }, 0);

          const updatedCust = {
            ...c,
            totalSpent: c.totalSpent + newSale.totalHT,
            activeKegsConsigned: c.activeKegsConsigned + kegsCount,
          };
          syncSaveCustomer(updatedCust);

          return updatedCust;
        }
        return c;
      });
    });
  };

  // Handler: Restock an item
  const handleRestock = (productId: string, quantity: number, reason = 'Réapprovisionnement Brasserie/Fournisseur') => {
    let targetProdName = '';
    let prevStock = 0;
    let nextStock = 0;

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          targetProdName = p.name;
          prevStock = p.stock;
          nextStock = p.stock + quantity;
          const updated = {
            ...p,
            stock: nextStock,
            updatedAt: new Date().toISOString(),
          };
          syncSaveProduct(updated);
          return updated;
        }
        return p;
      })
    );

    const mov: StockMovement = {
      id: `mov-${Date.now()}`,
      productId,
      productName: targetProdName,
      type: 'in',
      quantity,
      previousStock: prevStock,
      newStock: nextStock,
      reason,
      date: new Date().toISOString(),
      operator: 'Gestionnaire Entrepôt Boissons',
    };
    setMovements((prev) => [mov, ...prev]);
    syncSaveMovement(mov);
  };

  // Handler: Add a brand new product
  const handleAddProduct = (newProd: Omit<Product, 'id' | 'updatedAt'>) => {
    const id = `prod-${Date.now()}`;
    const product: Product = {
      ...newProd,
      id,
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [product, ...prev]);
    syncSaveProduct(product);

    if (newProd.stock > 0) {
      const mov: StockMovement = {
        id: `mov-${Date.now()}`,
        productId: id,
        productName: newProd.name,
        type: 'in',
        quantity: newProd.stock,
        previousStock: 0,
        newStock: newProd.stock,
        reason: 'Réception initiale brasserie/embouteilleur',
        date: new Date().toISOString(),
        operator: 'Direction des Approvisionnements',
      };
      setMovements((prev) => [mov, ...prev]);
      syncSaveMovement(mov);
    }
  };

  // Handler: Update product
  const handleUpdateProduct = (updated: Product) => {
    // If stock changed directly, log a movement
    const prev = products.find((p) => p.id === updated.id);
    if (prev && prev.stock !== updated.stock) {
      const diff = updated.stock - prev.stock;
      const mov: StockMovement = {
        id: `mov-${Date.now()}`,
        productId: updated.id,
        productName: updated.name,
        type: diff > 0 ? 'in' : 'out',
        quantity: Math.abs(diff),
        previousStock: prev.stock,
        newStock: updated.stock,
        reason: 'Ajustement manuel inventaire',
        date: new Date().toISOString(),
        operator: 'Responsable Stock',
      };
      setMovements((prevMovs) => [mov, ...prevMovs]);
      syncSaveMovement(mov);
    }
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    syncSaveProduct(updated);
  };

  // Handler: Delete product
  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    syncDeleteProduct(productId);
  };

  // Handler: Add Customer
  const handleAddCustomer = (newCust: Omit<Customer, 'id' | 'createdAt' | 'totalSpent'>) => {
    const id = `cust-${Date.now()}`;
    const cust: Customer = {
      ...newCust,
      id,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [cust, ...prev]);
    syncSaveCustomer(cust);
  };

  // Handler: Update Customer
  const handleUpdateCustomer = (updated: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    syncSaveCustomer(updated);
  };

  // Handler: Add Seller / User
  const handleAddSeller = (newSeller: Omit<Seller, 'id'>) => {
    const id = `sel-${Date.now()}`;
    const seller: Seller = {
      ...newSeller,
      id,
      status: newSeller.status || 'Actif',
      lastLogin: new Date().toISOString(),
    };
    setSellers((prev) => [...prev, seller]);
    syncSaveSeller(seller);
  };

  // Handler: Update Seller / User
  const handleUpdateSeller = (updatedSeller: Seller) => {
    setSellers((prev) => prev.map((s) => (s.id === updatedSeller.id ? updatedSeller : s)));
    syncSaveSeller(updatedSeller);
  };

  // Handler: Delete Seller / User
  const handleDeleteSeller = (sellerId: string) => {
    setSellers((prev) => prev.filter((s) => s.id !== sellerId));
    syncDeleteSeller(sellerId);
  };

  // Handler: Update Exchange Rates
  const handleUpdateExchangeRates = (newRates: ExchangeRateConfig) => {
    setExchangeRates(newRates);
    syncSaveExchangeRates(newRates);
  };

  // Handler: Add Exchange Transaction
  const handleAddExchangeTransaction = (newTx: Omit<ExchangeTransaction, 'id'>) => {
    const id = `exc-${Date.now()}`;
    const tx: ExchangeTransaction = { ...newTx, id };
    setExchangeTransactions((prev) => [tx, ...prev]);
    syncSaveExchangeTransaction(tx);
  };

  // Handler: Delete Exchange Transaction
  const handleDeleteExchangeTransaction = (id: string) => {
    setExchangeTransactions((prev) => prev.filter((tx) => tx.id !== id));
    syncDeleteExchangeTransaction(id);
  };

  // Handler: Save Settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    syncSaveSettings(newSettings);
  };

  // Handler: Update Sale / Invoice status
  const handleUpdateSaleStatus = (
    saleId: string,
    newStatus: 'completed' | 'pending' | 'cancelled',
    paymentMethod?: Sale['paymentMethod']
  ) => {
    setSales((prev) =>
      prev.map((s) => {
        if (s.id === saleId) {
          const updated: Sale = {
            ...s,
            status: newStatus,
            ...(paymentMethod ? { paymentMethod } : {}),
          };
          syncSaveSale(updated);
          return updated;
        }
        return s;
      })
    );
  };

  // Reset demo data
  const handleResetAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.SELLERS);
    localStorage.removeItem(STORAGE_KEYS.SALES);
    localStorage.removeItem(STORAGE_KEYS.MOVEMENTS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.EXCHANGE_RATES);
    localStorage.removeItem(STORAGE_KEYS.EXCHANGE_TRANSACTIONS);
    setProducts(INITIAL_PRODUCTS);
    setSellers(INITIAL_SELLERS);
    setSales(generateInitialSales());
    setMovements(INITIAL_MOVEMENTS);
    setCustomers(INITIAL_CUSTOMERS);
    setSettings(DEFAULT_SETTINGS);
    setExchangeRates(DEFAULT_EXCHANGE_RATES);
    setExchangeTransactions(INITIAL_EXCHANGE_TRANSACTIONS);
    syncResetAllDataToDefault();
  };

  // Quick sale for specific seller
  const handleOpenSaleForSeller = (sellerId: string) => {
    setSelectedSellerForSale(sellerId);
    setSelectedCustomerForSale(null);
    setIsNewSaleOpen(true);
  };

  // Quick sale for specific customer
  const handleStartSaleForCustomer = (customer: Customer) => {
    setSelectedCustomerForSale({
      name: customer.name,
      company: customer.company,
    });
    setSelectedSellerForSale(undefined);
    setIsNewSaleOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          {/* Brand Wordmark */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-xs ring-1 ring-amber-600/30 shrink-0 hover:scale-105 transition-transform"
              title="Distribution de Boissons & Eaux"
            >
              <WaterBottleLogo className="w-5 h-5 text-white drop-shadow-xs" />
            </span>
            <div className="leading-tight">
              <span className="text-base font-bold tracking-tight text-slate-900 block">
                {settings.companyName || 'DistriBoissons Pro'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">
                Boissons Gazeuses & Alcoolisées
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'border-amber-600 text-amber-700 font-bold'
                  : 'border-transparent'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Tableau de Bord</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('inventory')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 flex items-center gap-1.5 ${
                activeTab === 'inventory' || activeTab === 'stocks'
                  ? 'border-amber-600 text-amber-700 font-bold'
                  : 'border-transparent'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Inventaire</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('customers')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 flex items-center gap-1.5 ${
                activeTab === 'customers'
                  ? 'border-amber-600 text-amber-700 font-bold'
                  : 'border-transparent'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Clients</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sales')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 flex items-center gap-1.5 ${
                activeTab === 'sales'
                  ? 'border-amber-600 text-amber-700 font-bold'
                  : 'border-transparent'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Ventes</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('invoices')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 flex items-center gap-1.5 ${
                activeTab === 'invoices'
                  ? 'border-amber-600 text-amber-700 font-bold'
                  : 'border-transparent'
              }`}
              title="Gestion des factures, créances et encaissements"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Factures</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('exchange')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 flex items-center gap-1.5 ${
                activeTab === 'exchange'
                  ? 'border-amber-600 text-amber-700 font-bold'
                  : 'border-transparent'
              }`}
              title="Change Dollars USD et Pesos DOP en Gourdes Haïtiennes (HTG)"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Change USD/DOP</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 flex items-center gap-1.5 ${
                activeTab === 'reports' || activeTab === 'profitability'
                  ? 'border-amber-600 text-amber-700 font-bold'
                  : 'border-transparent'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Rapports</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 flex items-center gap-1.5 ${
                activeTab === 'users'
                  ? 'border-amber-600 text-amber-700 font-bold'
                  : 'border-transparent'
              }`}
            >
              <UserCog className="w-3.5 h-3.5" />
              <span>Utilisateurs</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 flex items-center gap-1.5 ${
                activeTab === 'settings'
                  ? 'border-amber-600 text-amber-700 font-bold'
                  : 'border-transparent'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Paramètres</span>
            </button>
          </nav>

          {/* Primary Action Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* PWA Direct Mobile Install Button */}
            <PWAInstallButton />

            {/* Real-time Cloud Sync Badge */}
            <div
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isCloudConnected
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
              title={`Données connectées au Cloud Firestore en temps réel. Les modifications sur ordinateur et téléphone sont synchronisées instantanément. ${lastSyncTime ? `Dernière synchro : ${lastSyncTime}` : ''}`}
            >
              <span className={`w-2 h-2 rounded-full ${isCloudConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Cloud Synchro</span>
            </div>

            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Obtenir le lien de partage pour permettre aux utilisateurs de se connecter"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Partager</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMobileGuideOpen(true)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Guide de lancement mobile : Google Play et Apple App Store"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">App Store & Play</span>
              <span className="sm:hidden">Mobile</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedSellerForSale(undefined);
                setSelectedCustomerForSale(null);
                setIsNewSaleOpen(true);
              }}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Nouvelle Vente</span>
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Navigation Scroll */}
        <div className="lg:hidden flex items-center justify-around border-t border-slate-100 bg-slate-50/90 px-2 py-2 text-xs font-medium text-slate-600 overflow-x-auto gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-white text-amber-700 shadow-xs font-bold' : ''
            }`}
          >
            Tableau de Bord
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'inventory' || activeTab === 'stocks' ? 'bg-white text-amber-700 shadow-xs font-bold' : ''
            }`}
          >
            Inventaire
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('customers')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'customers' ? 'bg-white text-amber-700 shadow-xs font-bold' : ''
            }`}
          >
            Clients
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sales')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'sales' ? 'bg-white text-amber-700 shadow-xs font-bold' : ''
            }`}
          >
            Ventes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'invoices' ? 'bg-white text-amber-700 shadow-xs font-bold' : ''
            }`}
          >
            Factures
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('exchange')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'exchange' ? 'bg-white text-amber-700 shadow-xs font-bold' : ''
            }`}
          >
            Change (USD/DOP)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'reports' || activeTab === 'profitability' ? 'bg-white text-amber-700 shadow-xs font-bold' : ''
            }`}
          >
            Rapports
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'users' ? 'bg-white text-amber-700 shadow-xs font-bold' : ''
            }`}
          >
            Utilisateurs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'settings' ? 'bg-white text-amber-700 shadow-xs font-bold' : ''
            }`}
          >
            Paramètres
          </button>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <React.Suspense fallback={<ViewLoadingFallback />}>
          {activeTab === 'dashboard' && (
            <OverviewDashboard
              products={products}
              sellers={sellers}
              sales={sales}
              onOpenNewSale={() => {
                setSelectedSellerForSale(undefined);
                setSelectedCustomerForSale(null);
                setIsNewSaleOpen(true);
              }}
              onNavigateToStocks={() => setActiveTab('inventory')}
              onNavigateToSellers={() => setActiveTab('users')}
              onNavigateToSales={() => setActiveTab('sales')}
              onNavigateToInvoices={() => setActiveTab('invoices')}
              onNavigateToExchange={() => setActiveTab('exchange')}
              exchangeRates={exchangeRates}
              onRestock={handleRestock}
              onPrintSale={setSaleToPrint}
            />
          )}

          {(activeTab === 'inventory' || activeTab === 'stocks') && (
            <StockManagementView
              products={products}
              movements={movements}
              onUpdateProduct={handleUpdateProduct}
              onAddProduct={handleAddProduct}
              onRestock={handleRestock}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersManagementView
              customers={customers}
              onAddCustomer={handleAddCustomer}
              onUpdateCustomer={handleUpdateCustomer}
              onStartSaleForCustomer={handleStartSaleForCustomer}
            />
          )}

          {activeTab === 'sales' && (
            <SalesHistoryView
              sales={sales}
              sellers={sellers}
              products={products}
              customers={customers}
              onCompleteSale={handleCompleteSale}
              onOpenNewSale={() => {
                setSelectedSellerForSale(undefined);
                setSelectedCustomerForSale(null);
                setIsNewSaleOpen(true);
              }}
              onPrintSale={setSaleToPrint}
              defaultTaxRate={settings.defaultTaxRate}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoicesManagementView
              sales={sales}
              sellers={sellers}
              products={products}
              customers={customers}
              settings={settings}
              exchangeRates={exchangeRates}
              onUpdateSaleStatus={handleUpdateSaleStatus}
              onOpenNewSale={() => {
                setSelectedSellerForSale(undefined);
                setSelectedCustomerForSale(null);
                setIsNewSaleOpen(true);
              }}
              onPrintSale={setSaleToPrint}
            />
          )}

          {activeTab === 'exchange' && (
            <CurrencyExchangeView
              rates={exchangeRates}
              transactions={exchangeTransactions}
              sellers={sellers}
              onUpdateRates={handleUpdateExchangeRates}
              onAddTransaction={handleAddExchangeTransaction}
              onDeleteTransaction={handleDeleteExchangeTransaction}
            />
          )}

          {(activeTab === 'reports' || activeTab === 'profitability') && (
            <FinancialReportsView
              sales={sales}
              products={products}
              sellers={sellers}
            />
          )}

          {(activeTab === 'users' || activeTab === 'sellers') && (
            <UsersManagementView
              sellers={sellers}
              sales={sales}
              onAddSeller={handleAddSeller}
              onUpdateSeller={handleUpdateSeller}
              onDeleteSeller={handleDeleteSeller}
              onOpenNewSaleForSeller={handleOpenSaleForSeller}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsManagementView
              settings={settings}
              sellers={sellers}
              onSaveSettings={handleSaveSettings}
              onResetAllData={handleResetAllData}
              onOpenMobileGuide={() => setIsMobileGuideOpen(true)}
            />
          )}
        </React.Suspense>
      </main>

      {/* Lazy Modals loaded on-demand */}
      <React.Suspense fallback={null}>
        {isNewSaleOpen && (
          <NewSaleModal
            isOpen={isNewSaleOpen}
            onClose={() => setIsNewSaleOpen(false)}
            products={products}
            sellers={sellers}
            onCompleteSale={handleCompleteSale}
            initialSellerId={selectedSellerForSale}
            initialCustomerName={selectedCustomerForSale?.name}
            initialCustomerCompany={selectedCustomerForSale?.company}
            onPrintSale={setSaleToPrint}
            defaultTaxRate={settings.defaultTaxRate}
          />
        )}

        {saleToPrint && (
          <InvoiceReceiptModal
            sale={saleToPrint}
            settings={settings}
            onClose={() => setSaleToPrint(null)}
          />
        )}

        {isMobileGuideOpen && (
          <MobileDeploymentGuideModal
            isOpen={isMobileGuideOpen}
            onClose={() => setIsMobileGuideOpen(false)}
          />
        )}

        {isShareModalOpen && (
          <ShareAppModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
          />
        )}
      </React.Suspense>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              {settings.companyName || 'DistriBoissons & Vins SAS'}
            </span>
            <span>·</span>
            <span>SIRET: {settings.companySiret || '849 231 902 00028'}</span>
            <span>·</span>
            <span>Consignes: {settings.kegConsignmentDepositPrice || 3000} HTG/fût inox</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('inventory')}
              className="hover:text-slate-800 transition-colors"
            >
              Inventaire & Consignes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('customers')}
              className="hover:text-slate-800 transition-colors"
            >
              Clients CHR
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className="hover:text-slate-800 transition-colors"
            >
              Rapports
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className="hover:text-slate-800 transition-colors"
            >
              Paramètres
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
