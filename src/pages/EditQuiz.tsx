import { useState, useEffect } from "react";
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
  CheckCircle
} from "lucide-react";
import { apiService, CreateQuizRequest, CreateQuestionRequest, QuestionWithAnswer } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface QuestionFormData {
  questionText: string;
  questionImageFile: File | null;
  questionImageUrl: string | null;
  options: string[];
  optionImageFiles: (File | null)[];
  optionImageUrls: (string | null)[];
  correctAnswerIndex: number;
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
      
      // Set quiz data
      setQuizData({
        title: quiz.title,
        description: quiz.description || "",
        grade: quiz.grade,
        medium: quiz.medium,
        subject: quiz.subject,
        type: quiz.type,
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
        explanation: q.explanation || "",
      }));

      // Ensure at least 4 options for each question
      formQuestions.forEach((q) => {
        while (q.options.length < 4) {
          q.options.push("");
        }
        while (q.optionImageUrls.length < 4) {
          q.optionImageUrls.push(null);
        }
        while (q.optionImageFiles.length < 4) {
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
        explanation: "",
      },
    ]);
    setActiveTab(`question-${questions.length}`);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const validateQuiz = (): string | null => {
    if (!quizData.title.trim()) return "Quiz title is required";
    if (!quizData.grade) return "Grade is required";
    if (!quizData.medium) return "Medium is required";
    if (!quizData.subject) return "Subject is required";
    if (!quizData.type) return "Paper type is required";
    if (quizData.timeLimit <= 0) return "Time limit must be greater than 0";
    if (questions.length === 0) return "At least one question is required";

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim() && !q.questionImageUrl) {
        return `Question ${i + 1}: Either question text or image is required`;
      }
      if (q.options.some((opt, idx) => !opt.trim() && !q.optionImageUrls[idx])) {
        return `Question ${i + 1}: All options must have either text or image`;
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
            correctAnswerIndex: q.correctAnswerIndex,
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

      const quizRequest: CreateQuizRequest = {
        ...quizData,
        thumbnail: thumbnailUrl || undefined,
        questions: createQuestions,
      };

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

    return (
      <div className="space-y-2">
        {currentImage ? (
          <div className="relative">
            <img
              src={currentImage}
              alt="Uploaded"
              className="max-w-full h-auto max-h-64 rounded-lg border-2 border-border"
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
          <div className="border-2 border-dashed border-border rounded-lg p-4">
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
          <TabsList className="grid w-full grid-cols-auto">
            <TabsTrigger value="quiz">Quiz Details</TabsTrigger>
            {questions.map((_, index) => (
              <TabsTrigger key={index} value={`question-${index}`}>
                Question {index + 1}
              </TabsTrigger>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addQuestion}
              className="ml-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </TabsList>

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
                    <Label htmlFor="grade">Grade *</Label>
                    <Select
                      value={quizData.grade}
                      onValueChange={(value) => handleQuizDataChange("grade", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
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
                      onValueChange={(value) => handleQuizDataChange("subject", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="sinhala">Sinhala</SelectItem>
                        <SelectItem value="history">History</SelectItem>
                        <SelectItem value="geography">Geography</SelectItem>
                        <SelectItem value="ict">ICT</SelectItem>
                        <SelectItem value="commerce">Commerce</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Paper Type *</Label>
                    <Select
                      value={quizData.type}
                      onValueChange={(value) => handleQuizDataChange("type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select paper type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="past-papers">Past Papers</SelectItem>
                        <SelectItem value="model-papers">Model Papers</SelectItem>
                        <SelectItem value="school-papers">School Papers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

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
                    <Label>Answer Options *</Label>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="space-y-2 p-4 border-2 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Label className="font-semibold">
                            Option {String.fromCharCode(65 + optionIndex)} {optionIndex === question.correctAnswerIndex && (
                              <CheckCircle className="inline h-4 w-4 text-green-600 ml-1" />
                            )}
                          </Label>
                          <Button
                            type="button"
                            variant={question.correctAnswerIndex === optionIndex ? "default" : "outline"}
                            size="sm"
                            onClick={() =>
                              handleQuestionChange(questionIndex, "correctAnswerIndex", optionIndex)
                            }
                          >
                            {question.correctAnswerIndex === optionIndex ? "Correct Answer" : "Set as Correct"}
                          </Button>
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
                    ))}
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

