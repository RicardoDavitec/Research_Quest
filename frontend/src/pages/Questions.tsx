import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Question, SimilarQuestion, Subgroup } from '../types';
import './Questions.css';

const Questions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subgroups, setSubgroups] = useState<Subgroup[]>([]);
  const [similarQuestions, setSimilarQuestions] = useState<SimilarQuestion[]>([]);
  const [formData, setFormData] = useState({
    text: '',
    type: 'open_text',
    options: '',
    subgroupId: '',
    objective: '',
    targetAudience: '',
    researchName: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mergeAction, setMergeAction] = useState<'keep' | 'accept' | 'merge' | 'concatenate' | 'replace'>('keep');
  const [selectedSimilarQuestion, setSelectedSimilarQuestion] = useState<SimilarQuestion | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkingSimilarity, setCheckingSimilarity] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadQuestions();
    loadSubgroups();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await api.get<Question[]>('/questions');
      setQuestions(response.data);
    } catch (err: any) {
      setError('Erro ao carregar questões');
    }
  };

  const loadSubgroups = async () => {
    try {
      const response = await api.get<Subgroup[]>('/subgroups');
      setSubgroups(response.data);
    } catch (err: any) {
      setError('Erro ao carregar subgrupos');
    }
  };

  const checkSimilarity = async (text: string) => {
    if (!text || text.length < 10) {
      setSimilarQuestions([]);
      return;
    }

    setCheckingSimilarity(true);
    try {
      const response = await api.post('/similarity/compare?threshold=0.3&limit=5', {
        query: text,
        documents: questions.map(q => ({
          id: q.id,
          text: q.text
        })),
      });

      // Mapear resultados usando o ID retornado pelo backend
      const similar = response.data
        .map((item: any) => {
          const question = questions.find(q => q.id === item.id);
          return question ? {
            question,
            similarity: item.score,
          } : null;
        })
        .filter((item: SimilarQuestion | null): item is SimilarQuestion => item !== null && item.question.text !== text)
        .sort((a: SimilarQuestion, b: SimilarQuestion) => b.similarity - a.similarity);

      setSimilarQuestions(similar);
    } catch (err: any) {
      console.error('Erro ao verificar similaridade:', err);
      console.error('Detalhes:', err.response?.data);
    } finally {
      setCheckingSimilarity(false);
    }
  };

  const handleTextChange = (text: string) => {
    setFormData({ ...formData, text });
    
    // Limpar timeout anterior
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    // Configurar novo timeout para verificar similaridade
    const timeoutId = setTimeout(() => {
      checkSimilarity(text);
    }, 800);
    
    setDebounceTimeout(timeoutId);
  };

  const applyMergeAction = () => {
    if (!selectedSimilarQuestion) return;

    const similarText = selectedSimilarQuestion.question.text;
    const currentText = formData.text;

    let newText = currentText;

    switch (mergeAction) {
      case 'accept':
        newText = similarText;
        break;
      case 'merge':
        newText = `${currentText} | ${similarText}`;
        break;
      case 'concatenate':
        newText = `${currentText} ${similarText}`;
        break;
      case 'replace':
        newText = similarText;
        break;
      case 'keep':
      default:
        newText = currentText;
    }

    setFormData({ ...formData, text: newText });
    setSimilarQuestions([]);
    setSelectedSimilarQuestion(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Obter authorId do usuário logado
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (!user?.id) {
      setError('Usuário não autenticado');
      return;
    }

    const payload = {
      text: formData.text,
      type: formData.type,
      options: formData.options ? formData.options.split(',').map(o => o.trim()) : undefined,
      subgroupId: formData.subgroupId,
      authorId: user.id,
      objective: formData.objective || undefined,
      targetAudience: formData.targetAudience || undefined,
      researchName: formData.researchName || undefined,
    };

    try {
      if (editingId) {
        await api.patch(`/questions/${editingId}`, payload);
        setSuccess('Questão atualizada com sucesso!');
      } else {
        await api.post('/questions', payload);
        setSuccess('Questão criada com sucesso!');
      }
      
      resetForm();
      loadQuestions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar questão');
    }
  };

  const handleEdit = (question: Question) => {
    setFormData({
      text: question.text,
      type: question.type,
      options: question.options?.join(', ') || '',
      subgroupId: question.subgroupId,
      objective: (question as any).objective || '',
      targetAudience: (question as any).targetAudience || '',
      researchName: (question as any).researchName || '',
    });
    setEditingId(question.id);
    setSimilarQuestions([]);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir esta questão?')) return;

    try {
      await api.delete(`/questions/${id}`);
      setSuccess('Questão excluída com sucesso!');
      loadQuestions();
    } catch (err: any) {
      setError('Erro ao excluir questão');
    }
  };

  const resetForm = () => {
    setFormData({
      text: '',
      type: 'open_text',
      options: '',
      subgroupId: '',
      objective: '',
      targetAudience: '',
      researchName: '',
    });
    setEditingId(null);
    setSimilarQuestions([]);
    setSelectedSimilarQuestion(null);
  };

  const questionTypes = [
    { value: 'open_text', label: 'Texto Aberto' },
    { value: 'yes_no', label: 'Sim/Não' },
    { value: 'multiple_choice', label: 'Múltipla Escolha' },
    { value: 'quantitative', label: 'Quantitativa' },
    { value: 'qualitative', label: 'Qualitativa' },
    { value: 'scale', label: 'Escala' },
  ];

  return (
    <div className="page-content">
      <h1>Gestão de Questões</h1>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-card">
        <h2>{editingId ? 'Editar Questão' : 'Nova Questão'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Texto da Questão *</label>
            <textarea
              value={formData.text}
              onChange={(e) => handleTextChange(e.target.value)}
              rows={4}
              required
              placeholder="Digite o texto da questão..."
            />
            {checkingSimilarity && (
              <small className="text-muted">Verificando similaridade...</small>
            )}
          </div>

          {similarQuestions.length > 0 && (
            <div className="similarity-section">
              <div className="similarity-header">
                <h3>⚠️ Questões Semelhantes Encontradas ({similarQuestions.length})</h3>
                <p className="similarity-description">
                  Encontramos questões similares no banco de dados. Selecione uma abaixo e escolha uma ação.
                </p>
              </div>
              
              <div className="similar-questions-list">
                {similarQuestions.map((item, index) => {
                  const subgroup = subgroups.find(s => s.id === item.question.subgroupId);
                  return (
                    <div
                      key={item.question.id}
                      className={`similar-question-item ${selectedSimilarQuestion?.question.id === item.question.id ? 'selected' : ''}`}
                      onClick={() => setSelectedSimilarQuestion(item)}
                    >
                      <div className="similarity-badge">
                        <span className="similarity-score">{(item.similarity * 100).toFixed(1)}%</span>
                        <span className="similarity-rank">#{index + 1}</span>
                      </div>
                      <div className="question-content">
                        <div className="question-text">{item.question.text}</div>
                        <div className="question-meta">
                          <span className="meta-item">📋 Tipo: {item.question.type}</span>
                          <span className="meta-item">👥 Subgrupo: {subgroup?.name || 'N/A'}</span>
                        </div>
                      </div>
                      {selectedSimilarQuestion?.question.id === item.question.id && (
                        <div className="selected-indicator">✓ Selecionada</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedSimilarQuestion && (
                <div className="merge-actions-card">
                  <h4>🎯 Decisão sobre Similaridade</h4>
                  <p className="action-description">
                    Questão selecionada tem <strong>{(selectedSimilarQuestion.similarity * 100).toFixed(1)}%</strong> de similaridade.
                  </p>
                  
                  <div className="action-options">
                    <label className="action-radio">
                      <input
                        type="radio"
                        name="mergeAction"
                        value="keep"
                        checked={mergeAction === 'keep'}
                        onChange={(e) => setMergeAction(e.target.value as any)}
                      />
                      <div className="action-info">
                        <strong>✋ Manter Atual</strong>
                        <small>Ignorar similaridade e manter sua questão como está</small>
                      </div>
                    </label>

                    <label className="action-radio">
                      <input
                        type="radio"
                        name="mergeAction"
                        value="accept"
                        checked={mergeAction === 'accept'}
                        onChange={(e) => setMergeAction(e.target.value as any)}
                      />
                      <div className="action-info">
                        <strong>✅ Aceitar Semelhante</strong>
                        <small>Substituir completamente pela questão semelhante</small>
                      </div>
                    </label>

                    <label className="action-radio">
                      <input
                        type="radio"
                        name="mergeAction"
                        value="merge"
                        checked={mergeAction === 'merge'}
                        onChange={(e) => setMergeAction(e.target.value as any)}
                      />
                      <div className="action-info">
                        <strong>🔀 Mesclar</strong>
                        <small>Combinar ambas separadas por " | " (Ex: Texto atual | Texto semelhante)</small>
                      </div>
                    </label>

                    <label className="action-radio">
                      <input
                        type="radio"
                        name="mergeAction"
                        value="concatenate"
                        checked={mergeAction === 'concatenate'}
                        onChange={(e) => setMergeAction(e.target.value as any)}
                      />
                      <div className="action-info">
                        <strong>➕ Concatenar</strong>
                        <small>Juntar os textos com um espaço (Ex: Texto atual Texto semelhante)</small>
                      </div>
                    </label>

                    <label className="action-radio">
                      <input
                        type="radio"
                        name="mergeAction"
                        value="replace"
                        checked={mergeAction === 'replace'}
                        onChange={(e) => setMergeAction(e.target.value as any)}
                      />
                      <div className="action-info">
                        <strong>🔄 Substituir</strong>
                        <small>Substituir pela questão semelhante (igual a Aceitar)</small>
                      </div>
                    </label>
                  </div>

                  <div className="action-buttons">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={applyMergeAction}
                    >
                      Aplicar Decisão
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setSelectedSimilarQuestion(null);
                        setSimilarQuestions([]);
                      }}
                    >
                      Ignorar Todas
                    </button>
                  </div>
                </div>
              )}

              {!selectedSimilarQuestion && (
                <div className="no-selection-message">
                  👆 Clique em uma questão acima para selecionar e escolher uma ação
                </div>
              )}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Tipo *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Question['type'] })}
                required
              >
                {questionTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Subgrupo *</label>
              <select
                value={formData.subgroupId}
                onChange={(e) => setFormData({ ...formData, subgroupId: e.target.value })}
                required
              >
                <option value="">Selecione um subgrupo</option>
                {subgroups.map((subgroup) => (
                  <option key={subgroup.id} value={subgroup.id}>
                    {subgroup.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(formData.type === 'single_choice' || formData.type === 'multiple_choice') && (
            <div className="form-group">
              <label>Opções (separadas por vírgula)</label>
              <input
                type="text"
                value={formData.options}
                onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                placeholder="Opção 1, Opção 2, Opção 3"
              />
            </div>
          )}

          <div className="form-buttons">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Atualizar' : 'Cadastrar'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="table-card">
        <h2>Questões Cadastradas</h2>
        <table>
          <thead>
            <tr>
              <th>Texto</th>
              <th>Tipo</th>
              <th>Subgrupo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => {
              const subgroup = subgroups.find(s => s.id === question.subgroupId);
              return (
                <tr key={question.id}>
                  <td className="question-text-cell">{question.text}</td>
                  <td>{question.type}</td>
                  <td>{subgroup?.name || '-'}</td>
                  <td className="actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(question)}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(question.id)}
                    title="Excluir"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Questions;
