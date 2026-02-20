import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Upload, 
  X, 
  Save,
  Image as ImageIcon,
  FileText,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { apiService, CreateQuizRequest, CreateQuestionRequest, QuestionWithAnswer } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { OptimizedImage } from "@/components/OptimizedImage";

interface QuestionFormData {
  questionText: string;
  questionImageFile: File | null;
  questionImageUrl: string | null;
  options: string[];
  optionImageFiles: (File | null)[];
  optionImageUrls: (string | null)[];
  correctAnswerIndex: number;
  correctAnswerIndexes: number[]; // For multiple correct answers
  explanation: string;
}

const EditQuiz = () => {
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();
  const { toast } = useToast();
  
  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    grade: "",
    medium: "",
    subject: "",
    type: "",
    term: "",
    timeLimit: 60,
    difficulty: "Medium",
    year: new Date().getFullYear(),
    thumbnail: "",
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const [questions, setQuestions] = useState<QuestionFormData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("quiz");
  const [quizType, setQuizType] = useState<string>(""); // "scholarship", "al", "ol", or "" for regular
  const [selectedTopic, setSelectedTopic] = useState<string>(""); // For lessonwise topics

  useEffect(() => {
    if (quizId) {
      loadQuiz();
    }
  }, [quizId]);

  const loadQuiz = async () => {
    if (!quizId) return;
    
    try {
      setLoading(true);
      const { quiz, questions: quizQuestions } = await apiService.getQuizForEdit(quizId);
      
      // Determine quiz type from grade
      let detectedQuizType = "";
      if (quiz.grade === "grade-5") {
        detectedQuizType = "scholarship";
      } else if (quiz.grade === "grade-12") {
        // Check if it's A/L by subject
        const alSubjects = ["physics", "chemistry", "combined-mathematics", "biology"];
        if (alSubjects.includes(quiz.subject)) {
          detectedQuizType = "al";
        }
      } else if (quiz.grade === "grade-11") {
        // Check if it's O/L by subject
        const olSubjects = ["mother-language-sinhala", "mother-language-tamil", "religion-buddhism", 
                           "religion-christianity", "religion-islam", "religion-hinduism"];
        if (olSubjects.includes(quiz.subject)) {
          detectedQuizType = "ol";
        }
      }
      setQuizType(detectedQuizType);

      // Extract topic from description if lessonwise
      let topic = "";
      if (quiz.type === "lessonwise" && quiz.description) {
        const topicMatch = quiz.description.match(/\[Topic: (.+?)\]/);
        if (topicMatch) {
          topic = topicMatch[1];
        }
      }
      setSelectedTopic(topic);

      // Set quiz data
      setQuizData({
        title: quiz.title,
        description: quiz.description || "",
        grade: quiz.grade,
        medium: quiz.medium,
        subject: quiz.subject,
        type: quiz.type,
        term: (quiz as any).term || "",
        timeLimit: quiz.timeLimit,
        difficulty: quiz.difficulty,
        year: quiz.year,
        thumbnail: (quiz as any).thumbnail || "",
      });

      if ((quiz as any).thumbnail) {
        setThumbnailUrl((quiz as any).thumbnail);
      }

      // Convert questions to form data
      const sortedQuestions = [...quizQuestions].sort((a, b) => a.order - b.order);
      const formQuestions: QuestionFormData[] = sortedQuestions.map((q) => ({
        questionText: q.questionText || "",
        questionImageFile: null,
        questionImageUrl: q.questionImage || null,
        options: q.options || ["", "", "", ""],
        optionImageFiles: [null, null, null, null],
        optionImageUrls: q.optionImages || [null, null, null, null],
        correctAnswerIndex: q.correctAnswerIndex,
        correctAnswerIndexes: q.correctAnswerIndexes || [], // For multiple correct answers
        explanation: q.explanation || "",
      }));

      // Ensure at least 4 options for each question (support 4-5 options)
      formQuestions.forEach((q) => {
        // Keep existing options (4 or 5), don't pad if already 5
        while (q.options.length < 4) {
          q.options.push("");
        }
        while (q.optionImageUrls.length < q.options.length) {
          q.optionImageUrls.push(null);
        }
        while (q.optionImageFiles.length < q.options.length) {
          q.optionImageFiles.push(null);
        }
      });

      setQuestions(formQuestions.length > 0 ? formQuestions : [{
        questionText: "",
        questionImageFile: null,
        questionImageUrl: null,
        options: ["", "", "", ""],
        optionImageFiles: [null, null, null, null],
        optionImageUrls: [null, null, null, null],
        correctAnswerIndex: 0,
        correctAnswerIndexes: [], // For multiple correct answers
        explanation: "",
      }]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load quiz",
        variant: "destructive",
      });
      navigate("/admin/quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleQuizDataChange = (field: string, value: any) => {
    setQuizData((prev) => ({ ...prev, [field]: value }));
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[questionIndex].options[optionIndex] = value;
      return updated;
    });
  };

  const handleQuestionImageUpload = async (questionIndex: number, file: File) => {
    try {
      setUploading(true);
      const imageUrl = await apiService.uploadImageToBlob(file);
      handleQuestionChange(questionIndex, "questionImageUrl", imageUrl);
      handleQuestionChange(questionIndex, "questionImageFile", file);
      toast({
        title: "Image uploaded",
        description: "Question image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleOptionImageUpload = async (questionIndex: number, optionIndex: number, file: File) => {
    try {
      setUploading(true);
      const imageUrl = await apiService.uploadImageToBlob(file);
      setQuestions((prev) => {
        const updated = [...prev];
        updated[questionIndex].optionImageUrls[optionIndex] = imageUrl;
        updated[questionIndex].optionImageFiles[optionIndex] = file;
        return updated;
      });
      toast({
        title: "Image uploaded",
        description: "Option image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeQuestionImage = (questionIndex: number) => {
    handleQuestionChange(questionIndex, "questionImageUrl", null);
    handleQuestionChange(questionIndex, "questionImageFile", null);
  };

  const removeOptionImage = (questionIndex: number, optionIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[questionIndex].optionImageUrls[optionIndex] = null;
      updated[questionIndex].optionImageFiles[optionIndex] = null;
      return updated;
    });
  };

  const handleThumbnailUpload = async (file: File) => {
    try {
      setUploading(true);
      const imageUrl = await apiService.uploadImageToBlob(file);
      setThumbnailUrl(imageUrl);
      setThumbnailFile(file);
      handleQuizDataChange("thumbnail", imageUrl);
      toast({
        title: "Thumbnail uploaded",
        description: "Quiz thumbnail uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload thumbnail",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeThumbnail = () => {
    setThumbnailUrl(null);
    setThumbnailFile(null);
    handleQuizDataChange("thumbnail", "");
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: "",
        questionImageFile: null,
        questionImageUrl: null,
        options: ["", "", "", ""],
        optionImageFiles: [null, null, null, null],
        optionImageUrls: [null, null, null, null],
        correctAnswerIndex: 0,
        correctAnswerIndexes: [], // For multiple correct answers
        explanation: "",
      },
    ]);
    setActiveTab(`question-${questions.length}`);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions((prev) => prev.filter((_, i) => i !== index));
      // Navigate to a valid tab after deletion
      if (activeTab === `question-${index}`) {
        if (index > 0) {
          setActiveTab(`question-${index - 1}`);
        } else if (questions.length > 1) {
          setActiveTab(`question-0`);
        } else {
          setActiveTab("quiz");
        }
      }
    }
  };

  const getCurrentQuestionIndex = () => {
    if (activeTab.startsWith("question-")) {
      return parseInt(activeTab.replace("question-", ""));
    }
    return -1;
  };

  const navigateToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setActiveTab(`question-${index}`);
    }
  };

  const navigateToPreviousQuestion = () => {
    const currentIndex = getCurrentQuestionIndex();
    if (currentIndex > 0) {
      navigateToQuestion(currentIndex - 1);
    }
  };

  const navigateToNextQuestion = () => {
    const currentIndex = getCurrentQuestionIndex();
    if (currentIndex >= 0 && currentIndex < questions.length - 1) {
      navigateToQuestion(currentIndex + 1);
    }
  };

  const addOption = (questionIndex: number) => {
    if (questions[questionIndex].options.length < 5) {
      setQuestions((prev) => {
        const updated = [...prev];
        updated[questionIndex].options.push("");
        updated[questionIndex].optionImageFiles.push(null);
        updated[questionIndex].optionImageUrls.push(null);
        return updated;
      });
    }
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    if (questions[questionIndex].options.length > 4) {
      setQuestions((prev) => {
        const updated = [...prev];
        updated[questionIndex].options.splice(optionIndex, 1);
        updated[questionIndex].optionImageFiles.splice(optionIndex, 1);
        updated[questionIndex].optionImageUrls.splice(optionIndex, 1);
        // Adjust correct answer index if needed
        if (updated[questionIndex].correctAnswerIndex >= optionIndex) {
          updated[questionIndex].correctAnswerIndex = Math.max(0, updated[questionIndex].correctAnswerIndex - 1);
        }
        // Adjust multiple correct answer indexes
        updated[questionIndex].correctAnswerIndexes = updated[questionIndex].correctAnswerIndexes
          .filter(idx => idx !== optionIndex)
          .map(idx => idx > optionIndex ? idx - 1 : idx);
        return updated;
      });
    }
  };

  const toggleCorrectAnswer = (questionIndex: number, optionIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const correctAnswers = updated[questionIndex].correctAnswerIndexes;
      
      if (correctAnswers.includes(optionIndex)) {
        // Remove from multiple correct answers
        updated[questionIndex].correctAnswerIndexes = correctAnswers.filter(idx => idx !== optionIndex);
        // If no multiple answers left, set single correct answer
        if (updated[questionIndex].correctAnswerIndexes.length === 0) {
          updated[questionIndex].correctAnswerIndex = 0;
        }
      } else {
        // Add to multiple correct answers
        updated[questionIndex].correctAnswerIndexes = [...correctAnswers, optionIndex].sort((a, b) => a - b);
      }
      
      return updated;
    });
  };

  const setSingleCorrectAnswer = (questionIndex: number, optionIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[questionIndex].correctAnswerIndex = optionIndex;
      updated[questionIndex].correctAnswerIndexes = [];
      return updated;
    });
  };

  const validateQuiz = (): string | null => {
    if (!quizData.title.trim()) return "Quiz title is required";
    if (!quizType && !quizData.grade) return "Grade is required (or select a quiz type)";
    if (!quizData.medium) return "Medium is required";
    if (!quizData.subject) return "Subject is required";
    if (!quizData.type) return "Paper type is required";
    if (quizData.type === "lessonwise" && !selectedTopic) return "Topic is required for lessonwise papers";
    // Validate term for grades 1-13, model-papers and school-papers
    if (!quizType && quizData.grade && 
        (quizData.type === "model-papers" || quizData.type === "school-papers") && 
        !quizData.term) {
      return "Term is required for model papers and school papers";
    }
    if (quizData.timeLimit <= 0) return "Time limit must be greater than 0";
    if (questions.length === 0) return "At least one question is required";

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim() && !q.questionImageUrl) {
        return `Question ${i + 1}: Either question text or image is required`;
      }
      if (q.options.length < 4 || q.options.length > 5) {
        return `Question ${i + 1}: Must have 4 or 5 options`;
      }
      if (q.options.some((opt, idx) => !opt.trim() && !q.optionImageUrls[idx])) {
        return `Question ${i + 1}: All options must have either text or image`;
      }
      // Check if using multiple correct answers or single
      if (q.correctAnswerIndexes.length > 0) {
        // Multiple correct answers - validate all indexes are valid
        if (q.correctAnswerIndexes.some(idx => idx < 0 || idx >= q.options.length)) {
          return `Question ${i + 1}: Invalid correct answer index`;
        }
      } else {
        // Single correct answer
        if (q.correctAnswerIndex < 0 || q.correctAnswerIndex >= q.options.length) {
          return `Question ${i + 1}: Invalid correct answer index`;
        }
      }
    }

    return null;
  };

  const handleSubmit = async () => {
    if (!quizId) return;

    const validationError = validateQuiz();
    if (validationError) {
      toast({
        title: "Validation error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const createQuestions: CreateQuestionRequest[] = await Promise.all(
        questions.map(async (q, index) => {
          // Upload question image if not already uploaded
          let questionImageUrl = q.questionImageUrl;
          if (q.questionImageFile && !q.questionImageUrl) {
            questionImageUrl = await apiService.uploadImageToBlob(q.questionImageFile);
          }

          // Upload option images if not already uploaded
          const optionImageUrls = await Promise.all(
            q.optionImageFiles.map(async (file, optIdx) => {
              if (file && !q.optionImageUrls[optIdx]) {
                return await apiService.uploadImageToBlob(file);
              }
              return q.optionImageUrls[optIdx] || null;
            })
          );

          return {
            questionText: q.questionText.trim() || undefined,
            questionImage: questionImageUrl || undefined,
            options: q.options.map((opt) => opt.trim()),
            optionImages: optionImageUrls.filter((url) => url !== null) || undefined,
            correctAnswerIndex: q.correctAnswerIndexes.length > 0 ? q.correctAnswerIndexes[0] : q.correctAnswerIndex,
            correctAnswerIndexes: q.correctAnswerIndexes.length > 0 ? q.correctAnswerIndexes : undefined,
            explanation: q.explanation.trim() || undefined,
            order: index + 1,
          };
        })
      );

      // Upload thumbnail if not already uploaded
      let thumbnailUrl = quizData.thumbnail;
      if (thumbnailFile && !thumbnailUrl) {
        thumbnailUrl = await apiService.uploadImageToBlob(thumbnailFile);
      }

      // Determine grade based on quiz type
      let finalGrade = quizData.grade;
      if (quizType === "scholarship") {
        finalGrade = "grade-5";
      } else if (quizType === "al") {
        finalGrade = "grade-12";
      } else if (quizType === "ol") {
        finalGrade = "grade-11";
      }

      const quizRequest: CreateQuizRequest = {
        ...quizData,
        grade: finalGrade,
        thumbnail: thumbnailUrl || undefined,
        questions: createQuestions,
      };

      // Add topic to description if lessonwise
      if (quizData.type === "lessonwise" && selectedTopic) {
        // Remove old topic if exists
        let description = quizRequest.description || "";
        description = description.replace(/\[Topic: .+?\]/g, "").trim();
        quizRequest.description = `${description} [Topic: ${selectedTopic}]`.trim();
      }

      await apiService.updateQuiz(quizId, quizRequest);

      toast({
        title: "Success",
        description: "Quiz updated successfully!",
      });

      navigate("/admin/quizzes");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update quiz",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const ImageUploadButton = ({
    onUpload,
    currentImage,
    onRemove,
    disabled,
  }: {
    onUpload: (file: File) => void;
    currentImage: string | null;
    onRemove: () => void;
    disabled?: boolean;
  }) => {
    const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPasteFocused, setIsPasteFocused] = useState(false);
    const { toast } = useToast();
    const lastClickTimeRef = useRef<number>(0);

    // Handle clipboard paste
    useEffect(() => {
      const handlePaste = async (e: ClipboardEvent) => {
        // Only handle paste if this component is available and focused/clicked
        if (disabled || currentImage) return;
        
        // Check if container is focused or was recently clicked (within 2 seconds)
        const isContainerFocused = containerRef.current === document.activeElement || 
                                   containerRef.current?.contains(document.activeElement);
        const wasRecentlyClicked = Date.now() - lastClickTimeRef.current < 2000;
        
        if (!isContainerFocused && !wasRecentlyClicked) return;
        
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          
          // Check if the pasted item is an image
          if (item.type.indexOf('image') !== -1) {
            e.preventDefault();
            e.stopPropagation();
            
            const blob = item.getAsFile();
            if (blob) {
              // Convert blob to File
              const file = new File([blob], `pasted-image-${Date.now()}.png`, {
                type: blob.type || 'image/png',
              });
              
              onUpload(file);
              toast({
                title: "Image pasted",
                description: "Image has been pasted successfully",
              });
            }
            break;
          }
        }
      };

      // Add paste event listener to the document
      document.addEventListener('paste', handlePaste, true);
      
      return () => {
        document.removeEventListener('paste', handlePaste, true);
      };
    }, [disabled, currentImage, onUpload, toast]);

    const handleContainerClick = () => {
      lastClickTimeRef.current = Date.now();
      containerRef.current?.focus();
    };

    const handleContainerFocus = () => {
      setIsPasteFocused(true);
    };

    const handleContainerBlur = () => {
      setIsPasteFocused(false);
    };

    return (
      <div className="space-y-2">
        {currentImage ? (
          <div className="relative">
            <OptimizedImage
              src={currentImage}
              alt="Uploaded"
              className="max-w-full h-auto max-h-64 rounded-lg border-2 border-border"
              skeletonHeight="150px"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={onRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div 
            ref={containerRef}
            className={`border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer ${
              isPasteFocused 
                ? 'border-primary bg-primary/5' 
                : 'border-border'
            }`}
            onFocus={handleContainerFocus}
            onBlur={handleContainerBlur}
            onClick={handleContainerClick}
            tabIndex={0}
          >
            <input
              ref={setInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file);
              }}
              disabled={disabled}
            />
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => inputRef?.click()}
                disabled={disabled || uploading}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                or press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Ctrl+V</kbd> to paste from clipboard
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh">
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/admin/quizzes")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quizzes
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Edit Quiz</h1>
            <p className="text-muted-foreground text-lg">Update quiz details and questions</p>
          </div>
          <Button onClick={handleSubmit} disabled={saving || uploading} size="lg">
            <Save className="h-5 w-5 mr-2" />
            {saving ? "Saving..." : "Update Quiz"}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <TabsList>
              <TabsTrigger value="quiz">Quiz Details</TabsTrigger>
            </TabsList>
            <div className="flex gap-2 w-full sm:w-auto">
              {activeTab.startsWith("question-") && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={navigateToPreviousQuestion}
                    disabled={getCurrentQuestionIndex() <= 0}
                    className="flex-1 sm:flex-initial"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Select
                    value={getCurrentQuestionIndex() >= 0 ? getCurrentQuestionIndex().toString() : ""}
                    onValueChange={(value) => navigateToQuestion(parseInt(value))}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Jump to..." />
                    </SelectTrigger>
                    <SelectContent>
                      {questions.map((_, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          Question {index + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={navigateToNextQuestion}
                    disabled={getCurrentQuestionIndex() >= questions.length - 1}
                    className="flex-1 sm:flex-initial"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={addQuestion}
                className="flex-1 sm:flex-initial"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </div>

          <TabsContent value="quiz">
            <Card className="border-2 shadow-elegant bg-gradient-card">
              <CardHeader>
                <CardTitle>Quiz Information</CardTitle>
                <CardDescription>Update the basic details for this quiz</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Quiz Title *</Label>
                    <Input
                      id="title"
                      value={quizData.title}
                      onChange={(e) => handleQuizDataChange("title", e.target.value)}
                      placeholder="e.g., Mathematics Grade 10 - Paper 1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Year *</Label>
                    <Input
                      id="year"
                      type="number"
                      value={quizData.year}
                      onChange={(e) => handleQuizDataChange("year", parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quizType">Quiz Type *</Label>
                    <Select
                      value={quizType || "regular"}
                      onValueChange={(value) => {
                        const newQuizType = value === "regular" ? "" : value;
                        setQuizType(newQuizType);
                        // Auto-set grade based on quiz type
                        if (value === "scholarship") {
                          handleQuizDataChange("grade", "grade-5");
                        } else if (value === "al") {
                          handleQuizDataChange("grade", "grade-12");
                        } else if (value === "ol") {
                          handleQuizDataChange("grade", "grade-11");
                        } else {
                          handleQuizDataChange("grade", "");
                        }
                        // Reset subject when changing quiz type
                        handleQuizDataChange("subject", "");
                        setSelectedTopic("");
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select quiz type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Regular (Select Grade)</SelectItem>
                        <SelectItem value="scholarship">Scholarship Grade 5</SelectItem>
                        <SelectItem value="al">A/L (Advanced Level)</SelectItem>
                        <SelectItem value="ol">O/L (Ordinary Level)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade *</Label>
                    <Select
                      value={quizData.grade}
                      onValueChange={(value) => handleQuizDataChange("grade", value)}
                      disabled={!!quizType} // Disable if quiz type is selected
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={quizType ? "Auto-selected" : "Select grade"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grade-5">Grade 5</SelectItem>
                        <SelectItem value="grade-6">Grade 6</SelectItem>
                        <SelectItem value="grade-7">Grade 7</SelectItem>
                        <SelectItem value="grade-8">Grade 8</SelectItem>
                        <SelectItem value="grade-9">Grade 9</SelectItem>
                        <SelectItem value="grade-10">Grade 10</SelectItem>
                        <SelectItem value="grade-11">Grade 11</SelectItem>
                        <SelectItem value="grade-12">Grade 12</SelectItem>
                        <SelectItem value="grade-13">Grade 13</SelectItem>
                      </SelectContent>
                    </Select>
                    {quizType && (
                      <p className="text-xs text-muted-foreground">
                        Grade is automatically set based on quiz type
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medium">Medium *</Label>
                    <Select
                      value={quizData.medium}
                      onValueChange={(value) => handleQuizDataChange("medium", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select medium" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sinhala">Sinhala</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="tamil">Tamil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Select
                      value={quizData.subject}
                      onValueChange={(value) => {
                        handleQuizDataChange("subject", value);
                        setSelectedTopic(""); // Reset topic when subject changes
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {!quizType ? (
                          // Regular subjects
                          <>
                            <SelectItem value="mathematics">Mathematics</SelectItem>
                            <SelectItem value="science">Science</SelectItem>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="sinhala">Sinhala</SelectItem>
                            <SelectItem value="history">History</SelectItem>
                            <SelectItem value="geography">Geography</SelectItem>
                            <SelectItem value="ict">ICT</SelectItem>
                            <SelectItem value="commerce">Commerce</SelectItem>
                          </>
                        ) : quizType === "scholarship" ? (
                          // Scholarship subjects (general)
                          <>
                            <SelectItem value="scholarship">Scholarship (General)</SelectItem>
                          </>
                        ) : quizType === "al" ? (
                          // A/L subjects
                          <>
                            <SelectItem value="physics">Physics</SelectItem>
                            <SelectItem value="chemistry">Chemistry</SelectItem>
                            <SelectItem value="combined-mathematics">Combined Mathematics</SelectItem>
                            <SelectItem value="biology">Biology</SelectItem>
                          </>
                        ) : (
                          // O/L subjects
                          <>
                            <SelectItem value="mother-language-sinhala">Mother Language (Sinhala)</SelectItem>
                            <SelectItem value="mother-language-tamil">Mother Language (Tamil)</SelectItem>
                            <SelectItem value="religion-buddhism">Religion (Buddhism)</SelectItem>
                            <SelectItem value="religion-christianity">Religion (Catholicism / Christianity)</SelectItem>
                            <SelectItem value="religion-islam">Religion (Islam)</SelectItem>
                            <SelectItem value="religion-hinduism">Religion (Hinduism)</SelectItem>
                            <SelectItem value="english">English Language</SelectItem>
                            <SelectItem value="mathematics">Mathematics</SelectItem>
                            <SelectItem value="science">Science</SelectItem>
                            <SelectItem value="history">History</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Paper Type *</Label>
                    <Select
                      value={quizData.type}
                      onValueChange={(value) => {
                        handleQuizDataChange("type", value);
                        if (value !== "lessonwise") {
                          setSelectedTopic(""); // Reset topic if not lessonwise
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select paper type" />
                      </SelectTrigger>
                      <SelectContent>
                        {quizType === "scholarship" ? (
                          // Scholarship paper types
                          <>
                            <SelectItem value="past-papers">Past Papers</SelectItem>
                            <SelectItem value="model-papers">Model Papers</SelectItem>
                          </>
                        ) : (
                          // Regular, A/L, O/L paper types
                          <>
                            <SelectItem value="past-papers">Past Papers</SelectItem>
                            <SelectItem value="model-papers">Model Papers</SelectItem>
                            <SelectItem value="school-papers">School Papers</SelectItem>
                            <SelectItem value="lessonwise">Lessonwise Select</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Term Selection for Grades 1-13, Model Papers and School Papers */}
                  {!quizType && quizData.grade && 
                   (quizData.type === "model-papers" || quizData.type === "school-papers") && (
                    <div className="space-y-2">
                      <Label htmlFor="term">Term *</Label>
                      <Select
                        value={quizData.term}
                        onValueChange={(value) => handleQuizDataChange("term", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select term" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1st-term">1st Term</SelectItem>
                          <SelectItem value="2nd-term">2nd Term</SelectItem>
                          <SelectItem value="3rd-term">3rd Term</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Topic Selection for Lessonwise A/L Subjects */}
                  {quizData.type === "lessonwise" && quizType === "al" && quizData.subject && (
                    <div className="space-y-2">
                      <Label htmlFor="topic">Topic *</Label>
                      <Select
                        value={selectedTopic}
                        onValueChange={setSelectedTopic}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select topic" />
                        </SelectTrigger>
                        <SelectContent>
                          {quizData.subject === "physics" && (
                            <>
                              <SelectItem value="waves">Waves Related Questions</SelectItem>
                              <SelectItem value="mechanics">Mechanics</SelectItem>
                              <SelectItem value="thermodynamics">Thermodynamics</SelectItem>
                              <SelectItem value="optics">Optics</SelectItem>
                              <SelectItem value="electricity">Electricity & Magnetism</SelectItem>
                              <SelectItem value="modern-physics">Modern Physics</SelectItem>
                            </>
                          )}
                          {quizData.subject === "chemistry" && (
                            <>
                              <SelectItem value="organic">Organic Chemistry</SelectItem>
                              <SelectItem value="inorganic">Inorganic Chemistry</SelectItem>
                              <SelectItem value="physical">Physical Chemistry</SelectItem>
                              <SelectItem value="analytical">Analytical Chemistry</SelectItem>
                            </>
                          )}
                          {quizData.subject === "combined-mathematics" && (
                            <>
                              <SelectItem value="algebra">Algebra</SelectItem>
                              <SelectItem value="geometry">Geometry</SelectItem>
                              <SelectItem value="trigonometry">Trigonometry</SelectItem>
                              <SelectItem value="calculus">Calculus</SelectItem>
                              <SelectItem value="statistics">Statistics & Probability</SelectItem>
                            </>
                          )}
                          {quizData.subject === "biology" && (
                            <>
                              <SelectItem value="cell-biology">Cell Biology</SelectItem>
                              <SelectItem value="genetics">Genetics</SelectItem>
                              <SelectItem value="ecology">Ecology</SelectItem>
                              <SelectItem value="human-biology">Human Biology</SelectItem>
                              <SelectItem value="plant-biology">Plant Biology</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty *</Label>
                    <Select
                      value={quizData.difficulty}
                      onValueChange={(value) => handleQuizDataChange("difficulty", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeLimit">Time Limit (minutes) *</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      min="1"
                      value={quizData.timeLimit}
                      onChange={(e) => handleQuizDataChange("timeLimit", parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={quizData.description}
                    onChange={(e) => handleQuizDataChange("description", e.target.value)}
                    placeholder="Enter quiz description..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Quiz Thumbnail (Optional)</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload a thumbnail image that will appear in the student paper view
                  </p>
                  <ImageUploadButton
                    onUpload={handleThumbnailUpload}
                    currentImage={thumbnailUrl || quizData.thumbnail || null}
                    onRemove={removeThumbnail}
                    disabled={uploading}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {questions.map((question, questionIndex) => (
            <TabsContent key={questionIndex} value={`question-${questionIndex}`}>
              <Card className="border-2 shadow-elegant bg-gradient-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Question {questionIndex + 1}</CardTitle>
                      <CardDescription>Add question text or image, and answer options</CardDescription>
                    </div>
                    {questions.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeQuestion(questionIndex)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Question Text</Label>
                      <Textarea
                        value={question.questionText}
                        onChange={(e) =>
                          handleQuestionChange(questionIndex, "questionText", e.target.value)
                        }
                        placeholder="Enter question text (or upload image below)"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Question Image (Optional)</Label>
                      <ImageUploadButton
                        onUpload={(file) => handleQuestionImageUpload(questionIndex, file)}
                        currentImage={question.questionImageUrl || null}
                        onRemove={() => removeQuestionImage(questionIndex)}
                        disabled={uploading}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Answer Options * (4-5 options required)</Label>
                        <p className="text-sm text-muted-foreground">
                          Click checkboxes for multiple correct answers, or use single button for one answer
                        </p>
                      </div>
                      {question.options.length < 5 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(questionIndex)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Option
                        </Button>
                      )}
                    </div>
                    {question.options.map((option, optionIndex) => {
                      const isMultipleMode = question.correctAnswerIndexes.length > 0;
                      const isCorrectInMultiple = question.correctAnswerIndexes.includes(optionIndex);
                      const isCorrectSingle = question.correctAnswerIndex === optionIndex && !isMultipleMode;
                      
                      return (
                      <div key={optionIndex} className="space-y-2 p-4 border-2 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Label className="font-semibold">
                              Option {String.fromCharCode(65 + optionIndex)} 
                              {(isCorrectInMultiple || isCorrectSingle) && (
                                <CheckCircle className="inline h-4 w-4 text-green-600 ml-1" />
                              )}
                            </Label>
                            <div className="flex items-center gap-2">
                              {/* Multiple Answer Mode - Checkbox */}
                              <Button
                                type="button"
                                variant={isCorrectInMultiple ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleCorrectAnswer(questionIndex, optionIndex)}
                                title="Toggle for multiple correct answers"
                              >
                                <input 
                                  type="checkbox" 
                                  checked={isCorrectInMultiple}
                                  onChange={() => {}}
                                  className="mr-1 pointer-events-none"
                                />
                                {isCorrectInMultiple ? "Correct" : "Mark Correct"}
                              </Button>
                              {/* Single Answer Mode - Radio */}
                              <Button
                                type="button"
                                variant={isCorrectSingle ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSingleCorrectAnswer(questionIndex, optionIndex)}
                                title="Set as single correct answer"
                              >
                                {isCorrectSingle ? "Single Answer" : "Set Single"}
                              </Button>
                            </div>
                          </div>
                          {question.options.length > 4 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(questionIndex, optionIndex)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <Input
                          value={option}
                          onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + optionIndex)} text (or upload image below)`}
                        />
                        <div className="space-y-2">
                          <Label className="text-sm">Option Image (Optional)</Label>
                          <ImageUploadButton
                            onUpload={(file) => handleOptionImageUpload(questionIndex, optionIndex, file)}
                            currentImage={question.optionImageUrls[optionIndex] || null}
                            onRemove={() => removeOptionImage(questionIndex, optionIndex)}
                            disabled={uploading}
                          />
                        </div>
                      </div>
                      );
                    })}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`explanation-${questionIndex}`}>Explanation (Optional)</Label>
                    <Textarea
                      id={`explanation-${questionIndex}`}
                      value={question.explanation}
                      onChange={(e) =>
                        handleQuestionChange(questionIndex, "explanation", e.target.value)
                      }
                      placeholder="Enter explanation for the correct answer..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default EditQuiz;

