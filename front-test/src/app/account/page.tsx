'use client';

import React, {useState} from 'react';
import AccountLinker from '../../components/AccountLinker';
import LinkedAccounts from '../../components/LinkedAccounts';

const AccountPage = () => {
    const [activeTab, setActiveTab] = useState<'link' | 'accounts'>('link');

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Gestión de Cuentas</h1>

            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('link')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'link'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Vincular Cuenta
                    </button>
                    <button
                        onClick={() => setActiveTab('accounts')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'accounts'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Mis Cuentas
                    </button>
                </nav>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                {activeTab === 'link' ? (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Vincular nueva cuenta de League of Legends</h2>
                        <AccountLinker/>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Tus cuentas vinculadas</h2>
                        <LinkedAccounts/>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountPage;
