import { useState, useCallback, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { WizardStep } from '@/components/WizardStep';
import { Step1AddBooks } from '@/components/Step1AddBooks';
import { Step2Template } from '@/components/Step2Template';
import { Step3Download } from '@/components/Step3Download';
import { Book, MoodType, TemplateType, MAX_BOOKS_PER_MONTH } from '@/types/book';
import { toast } from '@/hooks/use-toast';

/** Brief spinner when leaving book step so the template step does not pop in abruptly. */
const STEP_1_TO_2_SPINNER_MS = 420;

function getInitial() {
  const params = new URLSearchParams(window.location.search);
  const y = params.get('year');
  const m = params.get('month');
  const now = new Date();
  return {
    year: y ? parseInt(y) : now.getFullYear(),
    month: m ? parseInt(m) : now.getMonth(),
  };
}

export default function Index() {
  const init = getInitial();
  const [step, setStep] = useState(0);
  const [templateStepPending, setTemplateStepPending] = useState(false);
  const templateAdvanceLock = useRef(false);
  const [year, setYear] = useState(init.year);
  const [month, setMonth] = useState(init.month);
  const [entries, setEntries] = useState<Record<number, Book>>({});
  const entriesRef = useRef(entries);
  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);
  const [mood, setMood] = useState<MoodType>('minimal');
  const [template, setTemplate] = useState<TemplateType>('stack');

  const yearMonthRef = useRef({ year: init.year, month: init.month });
  useEffect(() => {
    yearMonthRef.current = { year, month };
  }, [year, month]);

  const handleMonthChange = useCallback((y: number, m: number) => {
    const prev = yearMonthRef.current;
    if (prev.year !== y || prev.month !== m) {
      setEntries({});
    }
    setYear(y);
    setMonth(m);
  }, []);

  const handleAddBook = useCallback((day: number, book: Book) => {
    const prev = entriesRef.current;
    const isNewDay = !prev[day];
    const count = Object.values(prev).filter(Boolean).length;
    if (isNewDay && count >= MAX_BOOKS_PER_MONTH) {
      toast({
        title: 'You can add up to 12 books.',
      });
      return;
    }
    setEntries((p) => ({ ...p, [day]: book }));
  }, []);

  const handleRemoveBook = useCallback((day: number) => {
    setEntries((prev) => {
      const next = { ...prev };
      delete next[day];
      return next;
    });
  }, []);

  const handleReset = () => {
    setStep(0);
    setEntries({});
    setMood('minimal');
    setTemplate('stack');
    templateAdvanceLock.current = false;
    setTemplateStepPending(false);
  };

  const goToTemplateStep = useCallback(() => {
    if (templateAdvanceLock.current) return;
    templateAdvanceLock.current = true;
    setTemplateStepPending(true);
    window.setTimeout(() => {
      setStep(1);
      setTemplateStepPending(false);
      templateAdvanceLock.current = false;
    }, STEP_1_TO_2_SPINNER_MS);
  }, []);

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-x-hidden bg-background text-foreground">
      {templateStepPending ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background/55 backdrop-blur-[2px]"
          aria-live="polite"
          aria-busy="true"
        >
          <Loader2 className="h-9 w-9 animate-spin text-muted-foreground" strokeWidth={1.5} aria-hidden />
        </div>
      ) : null}

      <WizardStep visible={step === 0}>
        <Step1AddBooks
          year={year}
          month={month}
          entries={entries}
          onMonthChange={handleMonthChange}
          onAddBook={handleAddBook}
          onRemoveBook={handleRemoveBook}
          onNext={goToTemplateStep}
          nextBusy={templateStepPending}
        />
      </WizardStep>

      <WizardStep visible={step === 1}>
        <Step2Template
          year={year}
          month={month}
          entries={entries}
          mood={mood}
          template={template}
          onTemplateChange={setTemplate}
          onBack={() => setStep(0)}
          onGenerate={() => setStep(2)}
        />
      </WizardStep>

      <WizardStep visible={step === 2}>
        <Step3Download
          year={year}
          month={month}
          entries={entries}
          mood={mood}
          template={template}
          onBack={() => setStep(1)}
          onReset={handleReset}
        />
      </WizardStep>
    </div>
  );
}
