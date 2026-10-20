import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import type { Category, Question } from '../types/game';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Download, 
  Upload, 
  RotateCcw, 
  Save, 
  CheckCircle2,
  XCircle,
  Bell,
  Clock,
  TimerOff,
  Trophy,
  Volume2,
  VolumeX,
  Smile,
  Music
} from 'lucide-react';
import { sound } from '../lib/soundEngine';
import { Button } from '../components/ui';

export const AdminView: React.FC = () => {
  const { 
    categories, 
    saveCategories, 
    tiebreakers, 
    saveTiebreakers, 
    audienceQuestions, 
    saveAudienceQuestions, 
    settings, 
    updateSettings, 
    importAllData, 
    restoreDefaults 
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'questions' | 'tiebreaker' | 'audience' | 'settings' | 'export'>('questions');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Question Edit Modal State
  const [editingQuestion, setEditingQuestion] = useState<{
    catIndex: number;
    qIndex: number | null; // null if adding new
    question: Question;
  } | null>(null);

  // New Category input
  const [newCategoryName, setNewCategoryName] = useState<string>('');

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Category CRUD
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const newCat: Category = {
      id: 'cat_' + Date.now(),
      category: newCategoryName.trim(),
      questions: [
        { id: `c_${Date.now()}_100`, points: 100, title: '', artist: '', audio: 'audio/' },
        { id: `c_${Date.now()}_200`, points: 200, title: '', artist: '', audio: 'audio/' },
        { id: `c_${Date.now()}_300`, points: 300, title: '', artist: '', audio: 'audio/' },
        { id: `c_${Date.now()}_400`, points: 400, title: '', artist: '', audio: 'audio/' },
        { id: `c_${Date.now()}_500`, points: 500, title: '', artist: '', audio: 'audio/' }
      ]
    };

    saveCategories([...categories, newCat]);
    setNewCategoryName('');
    showToast('Kategori baru berhasil ditambahkan!');
  };

  const handleDeleteCategory = (catIndex: number) => {
    if (window.confirm(`Hapus kategori "${categories[catIndex].category}" beserta seluruh soalnya?`)) {
      const updated = categories.filter((_, i) => i !== catIndex);
      saveCategories(updated);
      showToast('Kategori telah dihapus.');
    }
  };

  // Question CRUD
  const handleSaveQuestionForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    const { catIndex, qIndex, question } = editingQuestion;
    const catCopy = [...categories];
    const questionsCopy = [...catCopy[catIndex].questions];

    if (qIndex !== null) {
      questionsCopy[qIndex] = question;
    } else {
      questionsCopy.push(question);
    }

    catCopy[catIndex].questions = questionsCopy;
    saveCategories(catCopy);
    setEditingQuestion(null);
    showToast('Soal berhasil disimpan!');
  };

  const handleDeleteQuestion = (catIndex: number, qIndex: number) => {
    if (window.confirm('Hapus pertanyaan ini?')) {
      const catCopy = [...categories];
      catCopy[catIndex].questions = catCopy[catIndex].questions.filter((_, i) => i !== qIndex);
      saveCategories(catCopy);
      showToast('Soal berhasil dihapus.');
    }
  };

  // Tiebreaker Update
  const handleTiebreakerChange = (idx: number, field: string, val: string) => {
    const copy = [...tiebreakers];
    if (field === 'category') {
      copy[idx].category = val;
    } else if (field === 'title') {
      copy[idx].question.title = val;
    } else if (field === 'artist') {
      copy[idx].question.artist = val;
    } else if (field === 'audio') {
      copy[idx].question.audio = val;
    }
    saveTiebreakers(copy);
  };

  // Audience Update
  const handleAudienceChange = (idx: number, field: string, val: string) => {
    const copy = [...audienceQuestions];
    if (field === 'title') copy[idx].title = val;
    if (field === 'artist') copy[idx].artist = val;
    if (field === 'audio') copy[idx].audio = val;
    saveAudienceQuestions(copy);
  };

  // Export JSON
  const handleExportJSON = () => {
    const payload = {
      categories,
      tiebreakers,
      audience: audienceQuestions,
      settings
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anikarta_quiz_backup_${Date.now()}.json`;
    a.click();
    showToast('File backup JSON berhasil diunduh!');
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        importAllData(parsed);
        showToast('Data berhasil diimpor!');
      } catch (err) {
        alert('Gagal membaca file JSON. Pastikan format valid.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="board-container">
      <div className="content-container">
        {/* Toast Notification */}
        {successToast && (
          <div 
            style={{
              position: 'fixed',
              top: '80px',
              right: '24px',
              background: '#2A9D6A',
              color: '#FFFFFF',
              padding: '12px 20px',
              borderRadius: 'var(--border-radius-sm)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              zIndex: 999,
              fontWeight: 700
            }}
          >
            <CheckCircle2 size={18} />
            <span>{successToast}</span>
          </div>
        )}

        {/* Admin Title */}
        <div style={{ width: '100%', marginBottom: 'var(--space-5)' }}>
          <h2 className="font-display" style={{ fontSize: '1.8rem', color: 'var(--text-main)' }}>
            Panel Admin
          </h2>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', width: '100%', borderBottom: '2px solid var(--border-warm)', paddingBottom: 'var(--space-3)', marginBottom: 'var(--space-6)', overflowX: 'auto' }}>
          <Button
            variant={activeTab === 'questions' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('questions')}
          >
            Papan Utama
          </Button>
          <Button
            variant={activeTab === 'tiebreaker' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('tiebreaker')}
          >
            Tie-Breaker
          </Button>
          <Button
            variant={activeTab === 'audience' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('audience')}
          >
            Kuis Penonton
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('settings')}
          >
            Kustomisasi, Maskot & SFX
          </Button>
          <Button
            variant={activeTab === 'export' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('export')}
          >
            Backup & Ekspor
          </Button>
        </div>

      {/* TAB 1: Questions Board */}
      {activeTab === 'questions' && (
        <div style={{ width: '100%' }}>
          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="vn-panel-card" style={{ padding: '16px 20px', marginBottom: '28px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Nama Kategori Baru (misal: Anime 90s, Indo Rock)"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              style={{ flex: 1 }}
            />
            <Button type="submit" variant="primary" icon={<Plus size={16} />}>
              Tambah Kategori
            </Button>
          </form>

          {/* Categories & Questions List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {categories.map((cat, catIdx) => (
              <div key={cat.id || catIdx} className="vn-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 className="font-display" style={{ fontSize: '1.3rem', color: 'var(--text-main)' }}>
                    {cat.category}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Plus size={14} />}
                      onClick={() => setEditingQuestion({
                        catIndex: catIdx,
                        qIndex: null,
                        question: { id: `c_${Date.now()}`, points: (cat.questions.length + 1) * 100, title: '', artist: '', audio: 'audio/' }
                      })}
                    >
                      Tambah Soal
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      isIconOnly
                      onClick={() => handleDeleteCategory(catIdx)}
                      title="Hapus Kategori Ini"
                      icon={<Trash2 size={14} />}
                    />
                  </div>
                </div>

                {/* Questions Table */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {cat.questions.map((q, qIdx) => (
                    <div
                      key={q.id || qIdx}
                      className="vn-panel-card"
                      style={{
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                        <span className="font-mono" style={{ fontWeight: 800, color: 'var(--color-accent-rose)', minWidth: '70px' }}>
                          {q.points} PTS
                        </span>
                        <div>
                          <strong style={{ fontSize: '1rem' }}>{q.title || '(Belum ada judul)'}</strong>
                          <span style={{ color: 'var(--text-sub)', marginLeft: '8px', fontSize: '0.9rem' }}>
                            - {q.artist || '(Belum ada artis)'}
                          </span>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Path: {q.audio} {q.snippetStart !== undefined && `(Cuplikan: ${q.snippetStart}s - ${q.snippetStart + (q.snippetDuration || 0)}s)`}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          isIconOnly
                          onClick={() => setEditingQuestion({ catIndex: catIdx, qIndex: qIdx, question: { ...q } })}
                          title="Edit Soal Ini"
                          icon={<Edit3 size={14} />}
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          isIconOnly
                          onClick={() => handleDeleteQuestion(catIdx, qIdx)}
                          title="Hapus Soal Ini"
                          icon={<Trash2 size={14} />}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Tiebreaker */}
      {activeTab === 'tiebreaker' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ color: 'var(--text-sub)', marginBottom: '8px' }}>
            Babak penentu memiliki 3 slot kategori soal penentu:
          </p>
          {tiebreakers.map((tb, idx) => (
            <div key={idx} className="vn-panel" style={{ padding: '20px' }}>
              <div style={{ fontWeight: 800, marginBottom: '12px', color: 'var(--color-accent-rose)' }}>
                SLOT #{idx + 1}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label className="form-label">Nama Kategori</label>
                  <input
                    type="text"
                    className="form-input"
                    value={tb.category}
                    onChange={(e) => handleTiebreakerChange(idx, 'category', e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Judul Lagu Jawaban</label>
                  <input
                    type="text"
                    className="form-input"
                    value={tb.question.title}
                    onChange={(e) => handleTiebreakerChange(idx, 'title', e.target.value)}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Nama Artis</label>
                  <input
                    type="text"
                    className="form-input"
                    value={tb.question.artist}
                    onChange={(e) => handleTiebreakerChange(idx, 'artist', e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Path File Audio</label>
                  <input
                    type="text"
                    className="form-input"
                    value={tb.question.audio}
                    onChange={(e) => handleTiebreakerChange(idx, 'audio', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
          <Button variant="primary" icon={<Save size={16} />} onClick={() => showToast('Data Tie-Breaker tersimpan!')}>
            Simpan Perubahan Tie-Breaker
          </Button>
        </div>
      )}

      {/* TAB 3: Audience Questions */}
      {activeTab === 'audience' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ color: 'var(--text-sub)' }}>
            20 Pertanyaan untuk Kuis Penonton:
          </p>
          {audienceQuestions.map((aud, idx) => (
            <div key={aud.id || idx} className="vn-panel-card" style={{ padding: '14px 18px' }}>
              <div style={{ fontWeight: 800, color: 'var(--text-sub)', marginBottom: '8px' }}>
                NOMOR {aud.number}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '12px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Judul Lagu"
                  value={aud.title}
                  onChange={(e) => handleAudienceChange(idx, 'title', e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nama Artis"
                  value={aud.artist}
                  onChange={(e) => handleAudienceChange(idx, 'artist', e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Path File Audio (audio/...)"
                  value={aud.audio}
                  onChange={(e) => handleAudienceChange(idx, 'audio', e.target.value)}
                />
              </div>
            </div>
          ))}
          <Button variant="primary" icon={<Save size={16} />} onClick={() => showToast('Data Kuis Penonton tersimpan!')}>
            Simpan Kuis Penonton
          </Button>
        </div>
      )}

      {/* TAB 4: Customization, Mascot & SFX */}
      {activeTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
          {/* SECTION 1: SFX & Sound Customization */}
          <div className="vn-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Music size={22} color="var(--color-accent-rose)" />
              <h3 className="font-display" style={{ fontSize: '1.3rem', color: 'var(--text-main)' }}>
                Sistem Efek Suara (SFX)
              </h3>
            </div>

            {/* Master Toggle */}
            <div 
              className="vn-panel-card"
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '18px',
                background: settings.sfxEnabled ? '#F0FAF4' : 'var(--bg-card)',
                borderColor: settings.sfxEnabled ? '#72C296' : 'var(--border-warm)'
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {settings.sfxEnabled ? <Volume2 size={20} color="#2A9D6A" /> : <VolumeX size={20} color="var(--text-muted)" />}
                  <span>Status Suara SFX: {settings.sfxEnabled ? 'AKTIF' : 'NONAKTIF (MUTE)'}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginTop: '2px' }}>
                  Default sistem adalah nonaktif agar tidak menimbulkan suara mendadak di panggung.
                </div>
              </div>

              <Button
                type="button"
                variant={settings.sfxEnabled ? 'success' : 'primary'}
                onClick={() => updateSettings({ sfxEnabled: !settings.sfxEnabled })}
              >
                {settings.sfxEnabled ? 'Matikan Suara SFX' : 'Aktifkan Suara SFX'}
              </Button>
            </div>

            {/* Volume Slider */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className="form-label">Volume Suara SFX</label>
                <span className="font-mono" style={{ fontWeight: 700, color: 'var(--text-sub)' }}>
                  {Math.round((settings.sfxVolume ?? 0.7) * 100)}%
                </span>
              </div>
              <input
                type="range"
                className="progress-slider"
                min={0}
                max={1}
                step={0.05}
                value={settings.sfxVolume ?? 0.7}
                onChange={(e) => updateSettings({ sfxVolume: parseFloat(e.target.value) })}
              />
            </div>

            {/* Sound Profiles */}
            <div style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ marginBottom: '10px' }}>Pilihan Profil Suara (Sound Presets)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {[
                  { id: 'arcade', title: 'Arcade Synth', desc: 'Nada synthesizer retro 8-bit ceria' },
                  { id: 'gameshow', title: 'Classic Gameshow', desc: 'Bel meja TV nyata & buzzer tegas' },
                  { id: 'minimal', title: 'Minimal Acoustic', desc: 'Klik marimba halus & harpa lembut' }
                ].map((prof) => (
                  <div
                    key={prof.id}
                    className="vn-panel-card"
                    style={{
                      padding: '14px 18px',
                      cursor: 'pointer',
                      border: settings.sfxProfile === prof.id ? '2px solid var(--color-accent-rose)' : '2px solid var(--border-warm)',
                      background: settings.sfxProfile === prof.id ? '#FFF5F7' : 'var(--bg-card)'
                    }}
                    onClick={() => updateSettings({ sfxProfile: prof.id as 'arcade' | 'gameshow' | 'minimal' })}
                  >
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: settings.sfxProfile === prof.id ? 'var(--color-accent-rose)' : 'var(--text-main)' }}>
                      {prof.title}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-sub)', marginTop: '4px' }}>
                      {prof.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sound Test Playground */}
            <div>
              <label className="form-label" style={{ marginBottom: '8px' }}>Uji Coba Suara Langsung (Preview):</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={<Bell size={14} />}
                  onClick={() => {
                    const prev = sound.getEnabled();
                    sound.setEnabled(true);
                    sound.playBuzzer();
                    if (!prev) setTimeout(() => sound.setEnabled(false), 500);
                  }}
                >
                  Bel Tim
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={<CheckCircle2 size={14} color="var(--color-success)" />}
                  onClick={() => {
                    const prev = sound.getEnabled();
                    sound.setEnabled(true);
                    sound.playCorrect();
                    if (!prev) setTimeout(() => sound.setEnabled(false), 500);
                  }}
                >
                  Jawaban Benar
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={<XCircle size={14} color="var(--color-danger)" />}
                  onClick={() => {
                    const prev = sound.getEnabled();
                    sound.setEnabled(true);
                    sound.playWrong();
                    if (!prev) setTimeout(() => sound.setEnabled(false), 500);
                  }}
                >
                  Jawaban Salah
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={<Clock size={14} />}
                  onClick={() => {
                    const prev = sound.getEnabled();
                    sound.setEnabled(true);
                    sound.playTick();
                    if (!prev) setTimeout(() => sound.setEnabled(false), 500);
                  }}
                >
                  Detak Jam
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={<TimerOff size={14} color="var(--color-danger)" />}
                  onClick={() => {
                    const prev = sound.getEnabled();
                    sound.setEnabled(true);
                    sound.playTimeUp();
                    if (!prev) setTimeout(() => sound.setEnabled(false), 500);
                  }}
                >
                  Waktu Habis
                </Button>
                <Button
                  type="button"
                  variant="rose"
                  size="sm"
                  icon={<Trophy size={14} color="#D4A842" />}
                  onClick={() => {
                    const prev = sound.getEnabled();
                    sound.setEnabled(true);
                    sound.playFanfare();
                    if (!prev) setTimeout(() => sound.setEnabled(false), 800);
                  }}
                >
                  Fanfare Juara
                </Button>
              </div>
            </div>
          </div>

          {/* SECTION 2: Mascot Settings */}
          <div className="vn-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Smile size={22} color="var(--color-accent-rose)" />
              <h3 className="font-display" style={{ fontSize: '1.3rem', color: 'var(--text-main)' }}>
                Pengaturan Maskot Visual Novel (mascot.webp)
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div 
                style={{
                  background: '#FFF5F0',
                  padding: '16px',
                  borderRadius: 'var(--border-radius)',
                  border: '2px solid var(--border-warm)',
                  textAlign: 'center'
                }}
              >
                <img 
                  src="/mascot.webp" 
                  alt="Mascot Preview" 
                  style={{ height: '140px', width: 'auto', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.1))' }}
                />
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-sub)', marginTop: '8px' }}>
                  Anikarta Mascot
                </div>
              </div>

              <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="cbMascotNav"
                    checked={settings.showMascotNavbar !== false}
                    onChange={(e) => updateSettings({ showMascotNavbar: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="cbMascotNav" style={{ fontWeight: 600, cursor: 'pointer' }}>
                    Tampilkan Avatar Maskot di Header / Navbar
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="cbMascotModal"
                    checked={settings.showMascotModal !== false}
                    onChange={(e) => updateSettings({ showMascotModal: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="cbMascotModal" style={{ fontWeight: 600, cursor: 'pointer' }}>
                    Tampilkan Maskot di Kotak Dialog Soal (Host & Game)
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="cbMascotStage"
                    checked={settings.showMascotStage !== false}
                    onChange={(e) => updateSettings({ showMascotStage: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="cbMascotStage" style={{ fontWeight: 600, cursor: 'pointer' }}>
                    Tampilkan Maskot di Layar Proyektor Panggung (Stage View)
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="cbMascotSetup"
                    checked={settings.showMascotSetup !== false}
                    onChange={(e) => updateSettings({ showMascotSetup: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="cbMascotSetup" style={{ fontWeight: 600, cursor: 'pointer' }}>
                    Tampilkan Maskot di Formulir Persiapan Tim Awal (Setup)
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Event Gameplay Settings */}
          <div className="vn-panel" style={{ padding: '24px' }}>
            <h3 className="font-display" style={{ fontSize: '1.3rem', marginBottom: '18px', color: 'var(--text-main)' }}>
              Pengaturan Aturan Acara & Gameplay
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label className="form-label">Nama Acara / Judul Kuis</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.eventTitle}
                  onChange={(e) => updateSettings({ eventTitle: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label className="form-label">Durasi Stage Timer (Detik)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={settings.timerDuration}
                    onChange={(e) => updateSettings({ timerDuration: parseInt(e.target.value) || 20 })}
                  />
                </div>

                <div>
                  <label className="form-label">Tampilkan Berapa Juara Podium?</label>
                  <select
                    className="form-input"
                    value={settings.winnerCount || 3}
                    onChange={(e) => updateSettings({ winnerCount: parseInt(e.target.value) || 3 })}
                  >
                    <option value={1}>Juara 1 Saja</option>
                    <option value={2}>Juara 1 & 2</option>
                    <option value={3}>Juara 1, 2, & 3</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="cbTiebreaker"
                    checked={settings.enableTieBreaker !== false}
                    onChange={(e) => updateSettings({ enableTieBreaker: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="cbTiebreaker" style={{ fontWeight: 600, cursor: 'pointer' }}>
                    Aktifkan Babak Tie-Breaker jika Skor Imbang
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="cbPenalty"
                    checked={settings.penaltyOnWrong}
                    onChange={(e) => updateSettings({ penaltyOnWrong: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="cbPenalty" style={{ fontWeight: 600, cursor: 'pointer' }}>
                    Terapkan Penalti Pengurangan Poin Jika Tim Menjawab Salah
                  </label>
                </div>
              </div>

              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--color-divider)' }}>
                <Button 
                  type="button"
                  variant="danger"
                  icon={<RotateCcw size={16} />}
                  onClick={() => {
                    if (window.confirm('Kembalikan semua soal dan kategori ke pengaturan awal (default)?')) {
                      restoreDefaults();
                      showToast('Pengaturan telah di-reset ke bawaan.');
                    }
                  }}
                >
                  Reset ke Soal Bawaan (Default Data)
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Backup & Export */}
      {activeTab === 'export' && (
        <div className="vn-panel" style={{ padding: '24px', width: '100%' }}>
          <h3 className="font-display" style={{ fontSize: '1.3rem', marginBottom: '8px' }}>
            Backup & Pemulihan Data Kuis
          </h3>
          <p style={{ color: 'var(--text-sub)', marginBottom: '24px' }}>
            Unduh seluruh paket soal dan pengaturan ke format file JSON agar aman dan dapat dipindahkan ke komputer lain.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Button variant="primary" icon={<Download size={18} />} onClick={handleExportJSON}>
              Ekspor Backup JSON
            </Button>

            <label className="vn-btn vn-btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Upload size={18} />
              <span>Impor File JSON</span>
              <input
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleImportJSON}
              />
            </label>
          </div>
        </div>
      )}
      </div>

      {/* Question Edit / Add Popup Modal */}
      {editingQuestion && (
        <div className="modal-overlay">
          <div className="vn-modal-dialogue" style={{ maxWidth: 'var(--modal-max-sm)' }}>
            <h3 className="font-display" style={{ fontSize: '1.4rem', marginBottom: '16px' }}>
              {editingQuestion.qIndex !== null ? 'Edit Soal' : 'Tambah Soal Baru'}
            </h3>

            <form onSubmit={handleSaveQuestionForm}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">Nilai Poin</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editingQuestion.question.points}
                    onChange={(e) => setEditingQuestion({
                      ...editingQuestion,
                      question: { ...editingQuestion.question, points: parseInt(e.target.value) || 100 }
                    })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Judul Lagu</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingQuestion.question.title}
                    onChange={(e) => setEditingQuestion({
                      ...editingQuestion,
                      question: { ...editingQuestion.question, title: e.target.value }
                    })}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">Nama Artis / Penyanyi</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingQuestion.question.artist}
                  onChange={(e) => setEditingQuestion({
                    ...editingQuestion,
                    question: { ...editingQuestion.question, artist: e.target.value }
                  })}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">Path File Audio (.mp3)</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingQuestion.question.audio}
                  onChange={(e) => setEditingQuestion({
                    ...editingQuestion,
                    question: { ...editingQuestion.question, audio: e.target.value }
                  })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">Cuplikan Mulai (Detik)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0 (dari awal)"
                    value={editingQuestion.question.snippetStart ?? ''}
                    onChange={(e) => setEditingQuestion({
                      ...editingQuestion,
                      question: { ...editingQuestion.question, snippetStart: parseFloat(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div>
                  <label className="form-label">Durasi Cuplikan (Detik)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Contoh: 20 detik"
                    value={editingQuestion.question.snippetDuration ?? ''}
                    onChange={(e) => setEditingQuestion({
                      ...editingQuestion,
                      question: { ...editingQuestion.question, snippetDuration: parseFloat(e.target.value) || undefined }
                    })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="form-label">Catatan Trivia Host (Opsional)</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Catatan kecil untuk host (misal anime asal: Evangelion OP)"
                  value={editingQuestion.question.trivia || ''}
                  onChange={(e) => setEditingQuestion({
                    ...editingQuestion,
                    question: { ...editingQuestion.question, trivia: e.target.value }
                  })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button type="button" variant="secondary" onClick={() => setEditingQuestion(null)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary">
                  Simpan Soal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
