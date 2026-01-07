import { useState, useEffect } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';
import Modal from './Modal';
import Button from './Button';
import programAPI from '../api/program';

const BulkMCQUploadModal = ({ isOpen, onClose, objectiveId: propObjectiveId, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [errors, setErrors] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  
  // Objective selection state
  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [subModules, setSubModules] = useState([]);
  const [selectedSubModuleId, setSelectedSubModuleId] = useState('');
  const [objectives, setObjectives] = useState([]);
  const [selectedObjectiveId, setSelectedObjectiveId] = useState(propObjectiveId || '');
  const [loadingHierarchy, setLoadingHierarchy] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPrograms();
      if (propObjectiveId) {
        setSelectedObjectiveId(propObjectiveId);
      }
    }
  }, [isOpen, propObjectiveId]);

  useEffect(() => {
    if (selectedProgramId) {
      fetchModules();
    } else {
      setModules([]);
      setSelectedModuleId('');
    }
  }, [selectedProgramId]);

  useEffect(() => {
    if (selectedModuleId) {
      fetchSubModules();
    } else {
      setSubModules([]);
      setSelectedSubModuleId('');
      setObjectives([]);
      setSelectedObjectiveId('');
    }
  }, [selectedModuleId]);

  useEffect(() => {
    if (selectedSubModuleId) {
      fetchObjectives();
    } else {
      setObjectives([]);
      setSelectedObjectiveId('');
    }
  }, [selectedSubModuleId]);

  const fetchPrograms = async () => {
    try {
      const response = await programAPI.getAllPrograms();
      if (response.success) {
        setPrograms(response.data.programs || []);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const fetchModules = async () => {
    try {
      setLoadingHierarchy(true);
      const response = await programAPI.getModulesByProgram(selectedProgramId);
      if (response.success) {
        setModules(response.data.modules || []);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast.error('Failed to fetch modules');
    } finally {
      setLoadingHierarchy(false);
    }
  };

  const fetchSubModules = async () => {
    try {
      setLoadingHierarchy(true);
      const response = await programAPI.getSubModulesByModule(selectedModuleId);
      if (response.success) {
        setSubModules(response.data.subModules || []);
      }
    } catch (error) {
      console.error('Error fetching sub-modules:', error);
      setSubModules([]);
    } finally {
      setLoadingHierarchy(false);
    }
  };

  const fetchObjectives = async () => {
    try {
      setLoadingHierarchy(true);
      const response = await programAPI.getSubModuleObjectives(selectedSubModuleId);
      if (response.success) {
        setObjectives(response.data.objectives || []);
      }
    } catch (error) {
      console.error('Error fetching objectives:', error);
      toast.error('Failed to fetch objectives');
    } finally {
      setLoadingHierarchy(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setFile(selectedFile);
    setErrors([]);
    setPreviewData([]);
    parseExcelFile(selectedFile);
  };

  const parseExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });

        if (jsonData.length < 3) {
          toast.error('Excel file must have at least 3 rows (headers + instructions + data)');
          return;
        }

        // Parse the data starting from row 3 (index 2)
        const questions = [];
        const validationErrors = [];

        for (let i = 2; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue; // Skip empty rows

          const questionData = parseRow(row, i + 1, validationErrors);
          if (questionData) {
            questions.push(questionData);
          }
        }

        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          toast.error(`Found ${validationErrors.length} validation errors. Please check the preview.`);
        } else {
          setErrors([]);
          toast.success(`Successfully parsed ${questions.length} questions`);
        }

        setParsedData(questions);
        setPreviewData(questions.slice(0, 5)); // Show first 5 for preview
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        toast.error('Failed to parse Excel file. Please check the format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const parseRow = (row, rowNumber, errors) => {
    try {
      // Expected columns based on the format:
      // A: Question type (text/image)
      // B: Question
      // C: Answer type (single/multiple/fill in the blanks)
      // D-K: Option a through option h
      // L-S: Type of option a through type of option h (text/image)
      // T: Answers (comma-separated like "a,b,c,d")

      const questionType = (row[0] || '').toString().trim().toLowerCase();
      const question = (row[1] || '').toString().trim();
      const answerType = (row[2] || '').toString().trim().toLowerCase();
      const answers = (row[19] || '').toString().trim(); // Column T (index 19)

      if (!question) {
        errors.push(`Row ${rowNumber}: Question is required`);
        return null;
      }

      // Parse options (columns D-K, indices 3-10)
      const options = [];
      const optionTypes = [];
      
      for (let i = 0; i < 8; i++) {
        const optionIndex = 3 + i; // D-K
        const typeIndex = 11 + i; // L-S
        const optionText = (row[optionIndex] || '').toString().trim();
        const optionType = (row[typeIndex] || 'text').toString().trim().toLowerCase() || 'text';

        if (optionText) {
          options.push({
            text: optionText,
            type: optionType === 'image' ? 'image' : 'text',
            imageUrl: optionType === 'image' ? optionText : '', // If image, text might be URL
            imageKey: '',
          });
          optionTypes.push(optionType);
        }
      }

      if (options.length === 0) {
        errors.push(`Row ${rowNumber}: At least one option is required`);
        return null;
      }

      // Determine question type
      let questionImageUrl = '';
      let questionImageKey = '';
      if (questionType === 'image') {
        questionImageUrl = question;
      }

      // Determine answer type
      let questionTypeEnum = 'SINGLE_CHOICE';
      if (answerType.includes('multiple')) {
        questionTypeEnum = 'MULTIPLE_CHOICE';
      } else if (answerType.includes('fill')) {
        questionTypeEnum = 'ONE_WORD';
      }

      // Parse correct answers
      const correctAnswers = [];
      if (answers) {
        const answerParts = answers.split(',').map(a => a.trim().toLowerCase());
        correctAnswers.push(...answerParts);
      }

      if (correctAnswers.length === 0 && questionTypeEnum !== 'ONE_WORD') {
        errors.push(`Row ${rowNumber}: At least one correct answer is required`);
        return null;
      }

      return {
        question: questionType === 'image' ? '' : question,
        questionType: questionTypeEnum,
        questionImageUrl,
        questionImageKey,
        options,
        correctAnswer: correctAnswers[0] || '',
        correctAnswers: questionTypeEnum === 'MULTIPLE_CHOICE' ? correctAnswers : [],
        explanation: '',
        rowNumber,
      };
    } catch (error) {
      errors.push(`Row ${rowNumber}: Error parsing row - ${error.message}`);
      return null;
    }
  };

  const handleUpload = async () => {
    if (!finalObjectiveId) {
      toast.error('Please select an objective');
      return;
    }

    if (parsedData.length === 0) {
      toast.error('No valid questions to upload');
      return;
    }

    if (errors.length > 0) {
      toast.error('Please fix validation errors before uploading');
      return;
    }

    setUploading(true);
    setUploadProgress({ current: 0, total: parsedData.length });

    let successCount = 0;
    let failCount = 0;
    const uploadErrors = [];

      const finalObjectiveId = propObjectiveId || selectedObjectiveId;
      for (let i = 0; i < parsedData.length; i++) {
        const question = parsedData[i];
        try {
          await programAPI.createMCQ(finalObjectiveId, question);
          successCount++;
          setUploadProgress({ current: i + 1, total: parsedData.length });
        } catch (error) {
          failCount++;
          uploadErrors.push(`Row ${question.rowNumber}: ${error.message || 'Failed to create'}`);
          console.error(`Error creating MCQ for row ${question.rowNumber}:`, error);
        }
      }

    setUploading(false);

    if (successCount > 0) {
      toast.success(`Successfully created ${successCount} MCQ question(s)`);
    }
    if (failCount > 0) {
      toast.error(`Failed to create ${failCount} question(s). Check console for details.`);
      setErrors([...errors, ...uploadErrors]);
    }

    if (successCount > 0 && onSuccess) {
      onSuccess();
    }

    if (failCount === 0) {
      handleClose();
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedData([]);
    setPreviewData([]);
    setErrors([]);
    setUploadProgress({ current: 0, total: 0 });
    setSelectedProgramId('');
    setSelectedModuleId('');
    setSelectedSubModuleId('');
    setSelectedObjectiveId(propObjectiveId || '');
    setModules([]);
    setSubModules([]);
    setObjectives([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Bulk Upload MCQ Questions" size="lg">
      <div className="space-y-4">
        {/* Objective Selection */}
        {!propObjectiveId && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Select Objective</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Program</label>
                <select
                  value={selectedProgramId}
                  onChange={(e) => {
                    setSelectedProgramId(e.target.value);
                    setSelectedModuleId('');
                    setSelectedSubModuleId('');
                    setSelectedObjectiveId('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Select Program</option>
                  {programs.map((p) => (
                    <option key={p.id || p._id} value={p.id || p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Module</label>
                <select
                  value={selectedModuleId}
                  onChange={(e) => {
                    setSelectedModuleId(e.target.value);
                    setSelectedSubModuleId('');
                    setSelectedObjectiveId('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  disabled={!selectedProgramId || loadingHierarchy}
                >
                  <option value="">Select Module</option>
                  {modules.map((m) => (
                    <option key={m.id || m._id} value={m.id || m._id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Sub-Module</label>
                <select
                  value={selectedSubModuleId}
                  onChange={(e) => {
                    setSelectedSubModuleId(e.target.value);
                    setSelectedObjectiveId('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  disabled={!selectedModuleId || loadingHierarchy}
                >
                  <option value="">Select Sub-Module</option>
                  {subModules.map((sm) => (
                    <option key={sm.id || sm._id} value={sm.id || sm._id}>
                      {sm.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Objective</label>
                <select
                  value={selectedObjectiveId}
                  onChange={(e) => setSelectedObjectiveId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  disabled={!selectedSubModuleId || loadingHierarchy}
                >
                  <option value="">Select Objective</option>
                  {objectives.map((obj) => (
                    <option key={obj.id || obj._id} value={obj.id || obj._id}>
                      {obj.title || obj.text}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Excel Format Requirements:</h3>
          <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
            <li>Row 1: Headers (Question type, Question, Answer type, Option a-h, Type of option a-h, Answers)</li>
            <li>Row 2: Instructions (text/image, single/multiple/fill in the blanks, text/image, a,b,c,d)</li>
            <li>Row 3+: Data rows</li>
            <li>Question type: "text" or "image"</li>
            <li>Answer type: "single", "multiple", or "fill in the blanks"</li>
            <li>Option types: "text" or "image"</li>
            <li>Answers: Comma-separated (e.g., "a,b,c" for multiple choice)</li>
          </ul>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-semibold mb-2">Upload Excel File</label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <FileSpreadsheet className="h-4 w-4" />
              <span className="text-sm">Choose File</span>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
            </label>
            {file && (
              <span className="text-sm text-textMuted flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                {file.name}
              </span>
            )}
          </div>
        </div>

        {/* Preview */}
        {previewData.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">
              Preview ({parsedData.length} questions found, showing first 5)
            </h3>
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-2 py-1 text-left">Row</th>
                    <th className="px-2 py-1 text-left">Question</th>
                    <th className="px-2 py-1 text-left">Type</th>
                    <th className="px-2 py-1 text-left">Options</th>
                    <th className="px-2 py-1 text-left">Answers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {previewData.map((q, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-1">{q.rowNumber}</td>
                      <td className="px-2 py-1 max-w-xs truncate">{q.question || '(Image)'}</td>
                      <td className="px-2 py-1">{q.questionType}</td>
                      <td className="px-2 py-1">{q.options.length}</td>
                      <td className="px-2 py-1">{q.correctAnswers.join(', ') || q.correctAnswer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <h3 className="text-sm font-semibold text-red-900">
                Validation Errors ({errors.length})
              </h3>
            </div>
            <div className="max-h-40 overflow-y-auto">
              <ul className="text-xs text-red-800 space-y-1 list-disc list-inside">
                {errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">
                Uploading... {uploadProgress.current} / {uploadProgress.total}
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="ghost" onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!file || parsedData.length === 0 || errors.length > 0 || uploading || (!propObjectiveId && !selectedObjectiveId)}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {parsedData.length} Question(s)
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BulkMCQUploadModal;