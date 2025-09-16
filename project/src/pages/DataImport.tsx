import React, { useState } from 'react';
import { Upload, Download, Database, TrendingUp, BarChart3, CheckCircle, AlertCircle, FileText, Trash2, X } from 'lucide-react';
import { dataService } from '../services/dataService';
import FactoryResetModal from '../components/Modals/FactoryResetModal';

interface ImportStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  template: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  file?: File;
}

const DataImport: React.FC = () => {
  const [importSteps, setImportSteps] = useState<ImportStep[]>([
    {
      id: 'database',
      title: 'Importação de Base de Dados',
      description: 'Importe os dados financeiros no padrão Conta Azul (.xlsx)',
      icon: BarChart3,
      color: 'blue',
      template: 'template-conta-azul.xlsx',
      status: 'pending'
    }
  ]);

  const [showFactoryResetModal, setShowFactoryResetModal] = useState(false);
  const [clearingDatabase, setClearingDatabase] = useState<string | null>(null);
  const [deletingImport, setDeletingImport] = useState<string | null>(null);
  const [importToDelete, setImportToDelete] = useState<string | null>(null);

  const handleFileUpload = (stepId: string, file: File) => {
    setImportSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status: 'uploading', file }
        : step
    ));

    // Handle database import
    if (stepId === 'database') {
      handleContaAzulImport(file);
    }
  };

  const handleContaAzulImport = async (file: File) => {
    try {
      const result = await dataService.importContaAzulDatabase(file);
      
      setImportSteps(prev => prev.map(step => 
        step.id === 'database' 
          ? { 
              ...step, 
              status: result.success ? 'success' : 'error',
              result: result
            }
          : step
      ));

      // Force KPI sync to default (current dashboard month) right after import
      if (result.success) {
        // Default to September (index 8) as per dashboard
        dataService.updateKPIDataForPeriod(8, 8);
      }
    } catch (error) {
      setImportSteps(prev => prev.map(step => 
        step.id === 'database' 
          ? { 
              ...step, 
              status: 'error',
              result: {
                success: false,
                message: `Import failed: ${error}`,
                syntheticGroups: 0,
                analyticalAccounts: 0,
                errors: [error instanceof Error ? error.message : 'Unknown error']
              }
            }
          : step
      ));
    }
  };

  const downloadTemplate = (template: string) => {
    if (template === 'template-conta-azul.xlsx') {
      // Create CSV content for Conta Azul template
      const csvContent = [
        'Conta,Descrição,Tipo,Janeiro,Fevereiro,Março,Abril,Maio,Junho,Julho,Agosto,Setembro,Outubro,Novembro,Dezembro',
        '3.01.001,Receita de Vendas,Receita,50000,52000,48000,55000,58000,60000,62000,59000,57000,54000,51000,53000',
        '3.01.002,Receita de Serviços,Receita,25000,26000,24000,27000,28000,30000,31000,29000,28000,27000,25000,26000',
        '4.01.001,Custo dos Produtos Vendidos,Despesa,20000,21000,19000,22000,23000,24000,25000,24000,23000,22000,20000,21000',
        '4.02.001,Despesas com Pessoal,Despesa,15000,15000,15000,15000,15000,15000,15000,15000,15000,15000,15000,15000'
      ].join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'conta-azul-template.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For other templates, show a message
      alert(`Template ${template} will be available soon.`);
    }
  };

  const handleClearDatabase = async (type: 'database') => {
    setClearingDatabase(type);
    
    try {
      const result = await dataService.clearAllData();
      
      if (result.success) {
        // Reset the corresponding import step
        setImportSteps(prev => prev.map(step => 
          step.id === type 
            ? { ...step, status: 'pending', file: undefined, result: undefined }
            : step
        ));
      }
      
      // Show success/error message (you could add a toast notification here)
      console.log(result.message);
    } catch (error) {
      console.error('Clear database error:', error);
    } finally {
      setClearingDatabase(null);
    }
  };

  const handleFactoryReset = async () => {
    const result = await dataService.performFactoryReset();
    
    if (result.success) {
      // Reset all import steps
      setImportSteps(prev => prev.map(step => ({
        ...step,
        status: 'pending' as const,
        file: undefined,
        result: undefined
      })));
    }
    
    return result;
  };

  const handleDeleteImport = async (importId: string) => {
    setDeletingImport(importId);
    
    try {
      const result = dataService.deleteImport(importId);
      
      if (result.success) {
        // Force re-render by updating a state that triggers component refresh
        setImportToDelete(null);
      }
      
      console.log(result.message);
    } catch (error) {
      console.error('Delete import error:', error);
    } finally {
      setDeletingImport(null);
      setImportToDelete(null);
    }
  };

  const confirmDeleteImport = (importId: string) => {
    setImportToDelete(importId);
  };

  const cancelDeleteImport = () => {
    setImportToDelete(null);
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700',
        accent: 'text-blue-600'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: 'text-green-600',
        button: 'bg-green-600 hover:bg-green-700',
        accent: 'text-green-600'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        icon: 'text-purple-600',
        button: 'bg-purple-600 hover:bg-purple-700',
        accent: 'text-purple-600'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'uploading':
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Importação de Dados</h1>
          <p className="text-gray-600">
            Importe seus dados financeiros seguindo os passos abaixo na ordem indicada
          </p>
        </div>

        {/* Factory Reset Section */}
        <div className="mb-8">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Factory Reset</h3>
                <p className="text-red-700 mb-4">
                  Clear all data and start fresh. This will permanently delete all imported data, 
                  KPIs, budgets, and reset the system to its initial state.
                </p>
                <button
                  onClick={() => setShowFactoryResetModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Factory Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Import Steps */}
        <div className="space-y-6">
          {importSteps.map((step, index) => {
            const Icon = step.icon;
            const colors = getColorClasses(step.color);
            
            return (
              <div
                key={step.id}
                className={`${colors.bg} ${colors.border} border-2 rounded-xl p-6 transition-all duration-200 hover:shadow-lg`}
              >
                <div className="flex items-start gap-4">
                  {/* Step Number */}
                  <div className={`flex-shrink-0 w-8 h-8 ${colors.button} text-white rounded-full flex items-center justify-center font-bold text-sm`}>
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <Icon className={`w-8 h-8 ${colors.icon}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                      {getStatusIcon(step.status)}
                    </div>
                    
                    <p className="text-gray-600 mb-4">{step.description}</p>

                    {/* Detailed Instructions for Conta Azul Database */}
                    {step.id === 'database' && (
                      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2">📋 Estrutura do Arquivo (.xlsx):</h4>
                        <div className="text-sm text-blue-800 space-y-1">
                          <p><strong>Linha 1:</strong> Cabeçalhos (Categorias + meses alternando Previsto/Realizado)</p>
                          <p><strong>Linha 2:</strong> Pode estar vazia ou conter informações adicionais</p>
                          <p><strong>Linha 3+:</strong> Dados das categorias (nome + valores mensais)</p>
                          <p><strong>Coluna A:</strong> Categorias (nomes das contas/categorias)</p>
                          <p><strong>Colunas B-AA:</strong> Janeiro a Dezembro, alternando Previsto/Realizado</p>
                          <p><strong>Total:</strong> 27 colunas (A + 26 colunas de dados)</p>
                          <p className="text-blue-600 font-medium mt-2">
                            ✓ Sistema inicia mapeamento das categorias a partir da linha 3
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Upload Area */}
                      <div className="flex-1">
                        <label className="block">
                          <input
                            type="file"
                            accept=".xlsx"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(step.id, file);
                            }}
                          />
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 cursor-pointer transition-colors">
                            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">
                              {step.file ? step.file.name : 'Clique para selecionar arquivo'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Formato: .xlsx apenas (padrão Conta Azul)
                            </p>
                          </div>
                        </label>
                      </div>

                      {/* Template Download */}
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => downloadTemplate(step.template)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span className="text-sm font-medium">Baixar Template</span>
                        </button>
                      </div>

                      {/* Clear Database Button */}
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => handleClearDatabase(step.id as 'database')}
                          disabled={clearingDatabase === step.id}
                          className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {clearingDatabase === step.id ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          <span className="text-sm font-medium">Limpar</span>
                        </button>
                      </div>
                    </div>

                    {/* Status Message */}
                    {step.status === 'uploading' && (
                      <div className="mt-3 text-sm text-blue-600">
                        Processando arquivo...
                      </div>
                    )}
                    {step.status === 'success' && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <div className="text-sm text-green-600 font-medium mb-1">
                          ✓ Arquivo importado com sucesso
                        </div>
                        {(step as any).result && (
                          <div className="text-xs text-green-700">
                            {step.id === 'database' && (step as any).result && (
                              <>
                                Contas importadas: {(step as any).result.analyticalAccounts} | 
                                Períodos processados: {(step as any).result.syntheticGroups}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {step.status === 'error' && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg">
                        <div className="text-sm text-red-600 font-medium mb-1">
                          ✗ Erro ao processar arquivo
                        </div>
                        {(step as any).result && (
                          <div className="text-xs text-red-700 mt-2">
                            <div className="font-medium mb-2">{(step as any).result.message}</div>
                            {(step as any).result.errors && (step as any).result.errors.length > 0 && (
                              <div className="mt-3">
                                <div className="font-medium mb-2">Erros detalhados:</div>
                                <div className="bg-red-100 rounded p-2 max-h-40 overflow-y-auto">
                                  <ul className="space-y-1">
                                    {(step as any).result.errors.map((error: string, index: number) => (
                                      <li key={index} className="text-xs">
                                        <span className="font-mono bg-red-200 px-1 rounded">
                                          {index + 1}
                                        </span>
                                        <span className="ml-2">{error}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                            {step.id === 'database' && (step as any).result && (
                              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                <div className="text-yellow-800 text-xs">
                                  <div className="font-medium mb-1">💡 Dicas para corrigir:</div>
                                  <ul className="space-y-1">
                                    <li>• Verifique se o arquivo segue o padrão Conta Azul</li>
                                    <li>• Cabeçalhos devem estar exatamente como no template</li>
                                    <li>• Códigos de conta devem seguir formato numérico (ex: 3.01.001)</li>
                                    <li>• Tipo deve ser: Receita, Despesa, Ativo ou Passivo</li>
                                    <li>• Arquivo deve ter 15 colunas (Conta + Descrição + Tipo + 12 meses)</li>
                                  </ul>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Import History */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Histórico de Importações</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {(() => {
              const importHistory = dataService.getImportHistory();
              const resetLogs = dataService.getResetLogs();
              
              // Combine and sort all activities by timestamp
              const allActivities = [
                ...importHistory.map(item => ({ ...item, activityType: 'import' as const })),
                ...resetLogs.map(log => ({ 
                  id: log.id,
                  type: 'factory-reset' as const,
                  fileName: 'Sistema',
                  timestamp: log.timestamp,
                  status: log.success ? 'success' as const : 'error' as const,
                  recordCount: 0,
                  activityType: 'reset' as const,
                  duration: log.duration,
                  steps: log.steps
                }))
              ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

              if (allActivities.length === 0) {
                return (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma atividade registrada</h3>
                    <p className="text-gray-500">
                      O histórico de importações e ações do sistema aparecerá aqui após você realizar operações.
                    </p>
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Arquivo/Ação
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Detalhes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allActivities.map((activity) => {
                        const getTypeInfo = () => {
                          if (activity.activityType === 'reset') {
                            return {
                              icon: <Trash2 className="w-5 h-5 text-red-500 mr-2" />,
                              name: 'Factory Reset',
                              color: 'red'
                            };
                          }
                          
                          switch (activity.type) {
                            case 'database':
                              return {
                                icon: <Database className="w-5 h-5 text-blue-500 mr-2" />,
                                name: 'Base de Dados (Conta Azul)',
                                color: 'blue'
                              };
                            default:
                              return {
                                icon: <FileText className="w-5 h-5 text-gray-500 mr-2" />,
                                name: 'Desconhecido',
                                color: 'gray'
                              };
                          }
                        };

                        const typeInfo = getTypeInfo();
                        const formatDate = (timestamp: string) => {
                          return new Date(timestamp).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          });
                        };

                        const getStatusBadge = (status: string) => {
                          if (status === 'success') {
                            return (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Sucesso
                              </span>
                            );
                          } else {
                            return (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Erro
                              </span>
                            );
                          }
                        };

                        const getDetails = () => {
                          if (activity.activityType === 'reset') {
                            return `${(activity as any).duration}ms - ${(activity as any).steps?.length || 0} etapas`;
                          } else {
                            const importActivity = activity as any;
                            return `${importActivity.recordCount} contas importadas`;
                          }
                        };

                        return (
                          <tr key={activity.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {typeInfo.icon}
                                <span className="text-sm font-medium text-gray-900">{typeInfo.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {activity.fileName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(activity.timestamp)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(activity.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {getDetails()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button
                                onClick={() => confirmDeleteImport(activity.id)}
                                disabled={deletingImport === activity.id}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Deletar importação"
                              >
                                {deletingImport === activity.id ? (
                                  <div className="w-3 h-3 border border-red-500 border-t-transparent rounded-full animate-spin mr-1" />
                                ) : (
                                  <Trash2 className="w-3 h-3 mr-1" />
                                )}
                                Deletar
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Factory Reset Modal */}
      <FactoryResetModal
        isOpen={showFactoryResetModal}
        onClose={() => setShowFactoryResetModal(false)}
        onConfirm={handleFactoryReset}
      />

      {/* Delete Import Confirmation Modal */}
      {importToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Confirmar Exclusão
                    </h3>
                  </div>
                </div>
                <button
                  onClick={cancelDeleteImport}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Tem certeza que deseja deletar esta importação do histórico?
              </p>
              <p className="text-sm text-gray-500">
                Esta ação não pode ser desfeita. O registro será removido permanentemente do histórico de importações.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end space-x-3">
              <button
                onClick={cancelDeleteImport}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteImport(importToDelete)}
                disabled={deletingImport === importToDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {deletingImport === importToDelete ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Deletando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Deletar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataImport;