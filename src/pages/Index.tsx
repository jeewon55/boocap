import { useState, useCallback } from 'react';
import { StepIndicator } from '@/components/StepIndicator';
import { WizardStep } from '@/components/WizardStep';
import { Step1AddBooks } from '@/components/Step1AddBooks';
import { Step2Template } from '@/components/Step2Template';
import { Step3Download } from '@/components/Step3Download';
import { Book, MoodType, TemplateType } from '@/types/book';

const now = new Date();

export default function Index() {
  const [step, setStep] = useState(0);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [entries, setEntries] = useState<Record<number, Book>>({});
  const [mood, setMood] = useState<MoodType>('minimal');
  const [template, setTemplate] = useState<TemplateType>('stack');

  const handleMonthChange = useCallback((y: number, m: number) => {
    setYear(y);
    setMonth(m);
    setEntries({});
  }, []);

  const handleAddBook = useCallback((day: number, book: Book) => {
    setEntries((prev) => ({ ...prev, [day]: book }));
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
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <StepIndicator current={step} />

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
