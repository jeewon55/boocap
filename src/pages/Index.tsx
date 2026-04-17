import { useState, useCallback, useRef, useEffect } from 'react';
import { WizardStep } from '@/components/WizardStep';
import { Step1AddBooks } from '@/components/Step1AddBooks';
import { Step2Template } from '@/components/Step2Template';
import { Step3Download } from '@/components/Step3Download';
import { Book, MoodType, TemplateType, MAX_BOOKS_PER_MONTH } from '@/types/book';
import { toast } from '@/hooks/use-toast';

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
  const [year, setYear] = useState(init.year);
  const [month, setMonth] = useState(init.month);
  const [entries, setEntries] = useState<Record<number, Book>>({});
  const entriesRef = useRef(entries);
  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);
  const [mood, setMood] = useState<MoodType>('minimal');
  const [template, setTemplate] = useState<TemplateType>('stack');

  const handleMonthChange = useCallback((y: number, m: number) => {
    setYear(y);
    setMonth(m);
    setEntries({});
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
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground pt-12 sm:pt-14">
      <WizardStep visible={step === 0}>
        <Step1AddBooks
          year={year}
          month={month}
          entries={entries}
          onMonthChange={handleMonthChange}
          onAddBook={handleAddBook}
          onRemoveBook={handleRemoveBook}
          onNext={() => setStep(1)}
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
