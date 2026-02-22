import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Search,
  Save,
  X,
  Settings2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { apiService, Subject, CreateSubjectRequest, SystemSettings, UpdateSystemSettingsRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const ManageSubjects = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation(['admin', 'common']);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  
  // System Settings state
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState<boolean>(true);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);

  // Form state
  const [formData, setFormData] = useState<CreateSubjectRequest>({
    name: "",
    value: "",
    description: "",
    icon: "📚",
    category: "Grade 6-9",
    freeQuizCount: 4,
    isActive: true,
    displayOrder: 0,
  });

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "Grade 6-9", label: "Grade 6-9" },
    { value: "Grade 10-11", label: "Grade 10-11 (O/L)" },
    { value: "Grade 12-13", label: "Grade 12-13 (A/L)" },
    { value: "Scholarship", label: "Scholarship" },
  ];

  const iconOptions = [
    "📚", "💻", "🔬", "📐", "⚛️", "🧪", "🧬", "📊",
    "🌍", "🏛️", "📖", "❤️", "🎨", "☸️", "📈", "💼"
  ];

  useEffect(() => {
    loadSubjects();
    loadSystemSettings();
  }, []);

  useEffect(() => {
    filterSubjects();
  }, [searchQuery, selectedCategory, subjects]);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiService.getAllSubjects();
      setSubjects(data);
      setFilteredSubjects(data);
    } catch (err: any) {
      setError(err.message || t('common:status.error'));
      toast({
        title: t('common:feedback.errorTitle'),
        description: err.message || t('common:status.error'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSystemSettings = async () => {
    try {
      setSettingsLoading(true);
      const data = await apiService.getAdminSystemSettings();
      setSystemSettings(data);
    } catch (err: any) {
      console.error("Error loading system settings:", err);
      toast({
        title: t('common:feedback.warningTitle'),
        description: t('common:status.error'),
        variant: "destructive",
      });
      // Set default values if loading fails
      setSystemSettings({
        id: '',
        enableScholarship: false,
        enableAL: true,
        enableOL: false,
        enableGradeSelection: false,
        updatedAt: new Date().toISOString()
      });
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSaveSystemSettings = async () => {
    if (!systemSettings) return;

    try {
      setSavingSettings(true);
      const updateRequest: UpdateSystemSettingsRequest = {
        enableScholarship: systemSettings.enableScholarship,
        enableAL: systemSettings.enableAL,
        enableOL: systemSettings.enableOL,
        enableGradeSelection: systemSettings.enableGradeSelection
      };
      
      const updated = await apiService.updateSystemSettings(updateRequest);
      setSystemSettings(updated);
      
      toast({
        title: t('common:feedback.successTitle'),
        description: t('admin:manageSubjects.updateSuccess'),
      });
    } catch (err: any) {
      toast({
        title: t('common:feedback.errorTitle'),
        description: err.message || t('common:status.error'),
        variant: "destructive",
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSettingsChange = (field: keyof UpdateSystemSettingsRequest, value: boolean) => {
    if (!systemSettings) return;
    
    setSystemSettings(prev => prev ? {
      ...prev,
      [field]: value
    } : null);
  };

  const filterSubjects = () => {
    let filtered = subjects;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.value.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query)
      );
    }

    setFilteredSubjects(filtered);
  };

  const handleOpenDialog = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        name: subject.name,
        value: subject.value,
        description: subject.description,
        icon: subject.icon,
        category: subject.category,
        freeQuizCount: subject.freeQuizCount,
        isActive: subject.isActive,
        displayOrder: subject.displayOrder,
      });
    } else {
      setEditingSubject(null);
      setFormData({
        name: "",
        value: "",
        description: "",
        icon: "📚",
        category: "Grade 6-9",
        freeQuizCount: 4,
        isActive: true,
        displayOrder: 0,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSubject(null);
    setFormData({
      name: "",
      value: "",
      description: "",
      icon: "📚",
      category: "Grade 6-9",
      freeQuizCount: 4,
      isActive: true,
      displayOrder: 0,
    });
  };

  const handleSaveSubject = async () => {
    try {
      // Validation
      if (!formData.name.trim()) {
        toast({
          title: t('admin:createQuiz.validationError'),
          description: t('admin:manageSubjects.errors.nameRequired'),
          variant: "destructive",
        });
        return;
      }

      if (!formData.value.trim()) {
        toast({
          title: t('admin:createQuiz.validationError'),
          description: t('admin:manageSubjects.errors.valueRequired'),
          variant: "destructive",
        });
        return;
      }

      if (editingSubject) {
        // Update existing subject
        await apiService.updateSubject(editingSubject.id, formData);
        toast({
          title: t('common:feedback.successTitle'),
          description: t('admin:manageSubjects.updateSuccess'),
        });
      } else {
        // Create new subject
        await apiService.createSubject(formData);
        toast({
          title: t('common:feedback.successTitle'),
          description: t('admin:manageSubjects.createSuccess'),
        });
      }

      handleCloseDialog();
      loadSubjects();
    } catch (err: any) {
      toast({
        title: t('common:feedback.errorTitle'),
        description: err.message || t('common:status.error'),
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (subject: Subject) => {
    setSubjectToDelete(subject);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!subjectToDelete) return;

    try {
      await apiService.deleteSubject(subjectToDelete.id);
      toast({
        title: t('common:feedback.successTitle'),
        description: t('admin:manageSubjects.deleteSuccess'),
      });
      setDeleteDialogOpen(false);
      setSubjectToDelete(null);
      loadSubjects();
    } catch (err: any) {
      toast({
        title: t('common:feedback.errorTitle'),
        description: err.message || t('common:status.error'),
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof CreateSubjectRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Auto-generate value from name
  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name: name,
      value: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/admin-dashboard")}
                className="gap-2"
              >
                <ArrowLeft className="h-5 w-5" />
                {t('common:buttons.back')}
              </Button>
              <div className="h-8 w-px bg-border" />
              <div className="flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">{t('admin:manageSubjects.title')}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Quiz Categories Settings Card */}
        <Card className="border-2 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Settings2 className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-2xl">Quiz Category Settings</CardTitle>
                <CardDescription>
                  Enable or disable quiz categories for students
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {settingsLoading ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">{t('common:status.loading')}</div>
              </div>
            ) : systemSettings ? (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Scholarship Setting */}
                  <Card className="border-2">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">Scholarship Grade 5</h3>
                          <p className="text-sm text-muted-foreground">
                            Allow students to access Grade 5 Scholarship exam papers
                          </p>
                        </div>
                        <Switch
                          checked={systemSettings.enableScholarship}
                          onCheckedChange={(checked) => handleSettingsChange('enableScholarship', checked)}
                          className="ml-4"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* A/L Setting */}
                  <Card className="border-2">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">A/L (Advanced Level)</h3>
                          <p className="text-sm text-muted-foreground">
                            Allow students to access A/L subject quizzes
                          </p>
                        </div>
                        <Switch
                          checked={systemSettings.enableAL}
                          onCheckedChange={(checked) => handleSettingsChange('enableAL', checked)}
                          className="ml-4"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* O/L Setting */}
                  <Card className="border-2">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">O/L (Ordinary Level)</h3>
                          <p className="text-sm text-muted-foreground">
                            Allow students to access O/L subject quizzes
                          </p>
                        </div>
                        <Switch
                          checked={systemSettings.enableOL}
                          onCheckedChange={(checked) => handleSettingsChange('enableOL', checked)}
                          className="ml-4"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Grade Selection Setting */}
                  <Card className="border-2">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">Select by Grade</h3>
                          <p className="text-sm text-muted-foreground">
                            Allow students to select quizzes by grade (6-13)
                          </p>
                        </div>
                        <Switch
                          checked={systemSettings.enableGradeSelection}
                          onCheckedChange={(checked) => handleSettingsChange('enableGradeSelection', checked)}
                          className="ml-4"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={handleSaveSystemSettings}
                    disabled={savingSettings}
                    className="bg-gradient-hero hover:opacity-90 transition-opacity"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {savingSettings ? t('common:status.loading') : t('common:buttons.save')}
                  </Button>
                </div>

                {/* Info Message */}
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> These settings control which quiz categories are visible and accessible 
                    to students on their dashboard. Disabled categories will show as "Coming Soon" for students.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-destructive">
                Failed to load settings
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subject Management Section */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2">Subject Management</h2>
          <p className="text-muted-foreground">Manage subjects, free quiz counts, and display settings</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search subjects by name, value, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[250px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-gradient-hero hover:opacity-90 transition-opacity"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Subject
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{subjects.length}</div>
              <div className="text-sm text-muted-foreground">Total Subjects</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {subjects.filter(s => s.isActive).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Subjects</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {Math.round(subjects.reduce((sum, s) => sum + s.freeQuizCount, 0) / Math.max(subjects.length, 1))}
              </div>
              <div className="text-sm text-muted-foreground">Avg Free Quizzes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{filteredSubjects.length}</div>
              <div className="text-sm text-muted-foreground">Filtered Results</div>
            </CardContent>
          </Card>
        </div>

        {/* Subjects List */}
        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground">{t('common:status.loading')}</div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-destructive">{error}</div>
              <Button onClick={loadSubjects} className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : filteredSubjects.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No subjects found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedCategory !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by adding your first subject"}
              </p>
              {!searchQuery && selectedCategory === "all" && (
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-5 w-5 mr-2" />
                  Add Subject
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map(subject => (
              <Card
                key={subject.id}
                className="border-2 hover:shadow-lg transition-all"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{subject.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{subject.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {subject.value}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(subject)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(subject)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {subject.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{subject.category}</Badge>
                    {subject.isActive ? (
                      <Badge className="bg-green-500">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Free Quizzes:</span>
                      <span className="font-semibold">{subject.freeQuizCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Display Order:</span>
                      <span className="font-semibold">{subject.displayOrder}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSubject ? "Edit Subject" : "Add New Subject"}
            </DialogTitle>
            <DialogDescription>
              {editingSubject
                ? "Update the subject details below"
                : "Fill in the details to create a new subject"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Subject Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Mathematics"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Value (auto-generated) *</Label>
                <Input
                  id="value"
                  placeholder="e.g., mathematics"
                  value={formData.value}
                  onChange={(e) => handleInputChange("value", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief description of the subject"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grade 6-9">Grade 6-9</SelectItem>
                    <SelectItem value="Grade 10-11">Grade 10-11 (O/L)</SelectItem>
                    <SelectItem value="Grade 12-13">Grade 12-13 (A/L)</SelectItem>
                    <SelectItem value="Scholarship">Scholarship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <div className="grid grid-cols-8 gap-2">
                  {iconOptions.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      className={`text-2xl p-2 rounded border-2 transition-all hover:scale-110 ${
                        formData.icon === icon
                          ? "border-primary bg-primary/10"
                          : "border-transparent"
                      }`}
                      onClick={() => handleInputChange("icon", icon)}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="freeQuizCount">Free Quizzes Count</Label>
                <Input
                  id="freeQuizCount"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.freeQuizCount}
                  onChange={(e) => handleInputChange("freeQuizCount", parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => handleInputChange("displayOrder", parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange("isActive", checked)}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              <X className="h-4 w-4 mr-2" />
              {t('common:buttons.cancel')}
            </Button>
            <Button onClick={handleSaveSubject}>
              <Save className="h-4 w-4 mr-2" />
              {editingSubject ? t('common:buttons.save') : t('common:buttons.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the subject "{subjectToDelete?.name}".
              This action cannot be undone. If there are quizzes associated with this
              subject, the deletion will fail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:buttons.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive">
              {t('common:buttons.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageSubjects;
