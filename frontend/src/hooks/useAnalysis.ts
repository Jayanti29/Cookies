import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useStore } from '../store';
import { useLanguage } from '../i18n';
import { AnalysisResult } from '../types';

export function useAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setCurrentResult = useStore((s) => s.setCurrentResult);
  const { language } = useLanguage();
  const navigate = useNavigate();

  const handleResult = (result: AnalysisResult) => {
    setCurrentResult(result);
    navigate(`/results/${result.id}`);
  };

  const analyzeWebsite = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.checkWebsite(url, language);
      handleResult(res);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }, [language, navigate, setCurrentResult]);

  const analyzeMessage = useCallback(async (content: string, platform?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.checkMessage(content, platform, language);
      handleResult(res);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }, [language, navigate, setCurrentResult]);

  const analyzeJob = useCallback(async (content: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.checkJob(content, language);
      handleResult(res);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }, [language, navigate, setCurrentResult]);

  const analyzePayment = useCallback(async (content: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.checkPayment(content, language);
      handleResult(res);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }, [language, navigate, setCurrentResult]);

  const analyzeFile = useCallback(async (file: File, type: string) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('language', language);
      const res = await api.analyze(formData);
      handleResult(res);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }, [language, navigate, setCurrentResult]);

  return {
    loading,
    error,
    analyzeWebsite,
    analyzeMessage,
    analyzeJob,
    analyzePayment,
    analyzeFile,
  };
}
