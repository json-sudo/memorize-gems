type Props = {
  scripture: string;
  verseContent: string;
  hidden: 'scripture' | 'verseContent';
};

function mask(text: string) {
  // subtle masking — readable length, not the content
  const len = Math.min(12, Math.max(6, Math.floor(text.length / 6)));
  return '•'.repeat(len);
}

export default function ModeCardPreview({ scripture, verseContent, hidden }: Props) {
  const shownScripture = hidden === 'scripture' ? mask(scripture) : scripture;
  const shownVerse = hidden === 'verseContent' ? mask(verseContent) : verseContent;

  return (
    <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-3">
        <dl style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
            <div>
                {/* Scripture */}
                <dd
                className={`font-medium ${hidden === 'scripture' ? 'blur-[3px] select-none' : ''}`}
                >
                {shownScripture}
                </dd>
            </div>

            <div>
                {/* Verse content */}
                <dd
                className={`text-slate-300 h-[100px] ${
                    hidden === 'verseContent'
                    ? 'blur-[3px] select-none'
                    : 'overflow-hidden text-ellipsis'
                }`}
                >
                {shownVerse}
                </dd>
            </div>
        </dl>
    </div>
  );
}
