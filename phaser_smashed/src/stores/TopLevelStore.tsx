import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

interface TopLevelContextType {
  tl_width: number | null;
  tl_tailwind: string;
  tl_text_md: string;
  tl_text_lg: string;
  tl_text_xl: string;
  setTopLevelWidth: (width: number | null) => void;
  setTopLevelFontSizeTailwind: (fontSize: string) => void;
  setTopLevelFontSizeStyle: (fontSize: string) => void;
  setTopLevelFontSizeLg: (fontSize: string) => void;
  setTopLevelFontSizeXl: (fontSize: string) => void;
}

const TopLevelContext = createContext<TopLevelContextType | undefined>(
  undefined
);

export const TopLevelProvider = ({ children }: { children: ReactNode }) => {
  const [topLevelWidth, setTopLevelWidth] = useState<number | null>(null);
  const [topLevelFontSizeTailwind, setTopLevelFontSizeTailwind] =
    useState<string>('1vw');
  const [topLevelFontSizeMd, setTopLevelFontSizeMd] =
    useState<string>('1vw');
  const [topLevelFontSizeLg, setTopLevelFontSizeLg] = useState<string>('1vw');
  const [topLevelFontSizeXl, setTopLevelFontSizeXl] = useState<string>('1vw');

  const updateDimensions = () => {
    const topLevelEl = document.getElementById('top-level');
    if (topLevelEl) {
      const width = topLevelEl.clientWidth;
      if (width) {
        setTopLevelWidth(width);
        // For example, set font size to 10% of the container's width.
        const newFontSize = width * 0.01;
        // Note: Tailwind classes are static at build time.
        // This string is for reference; you may want to use inline styles instead.
        const newFontSizeTailwind = `text-[${newFontSize}px]`;
        const newFontSizeStyle = `${newFontSize}px`;
        const newFontSizeLg = `${newFontSize * 1.5}px`;
        const newFontSizeXl = `${newFontSize * 2}px`;

        console.log('newFontSizeTailwind', newFontSizeTailwind);
        console.log('newFontSizeStyle', newFontSizeStyle);

        setTopLevelFontSizeTailwind(newFontSizeTailwind);
        setTopLevelFontSizeMd(newFontSizeStyle);
        setTopLevelFontSizeLg(newFontSizeLg);
        setTopLevelFontSizeXl(newFontSizeXl);
      }
    }
  };

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  return (
    <TopLevelContext.Provider
      value={{
        tl_width: topLevelWidth,
        tl_tailwind: topLevelFontSizeTailwind,
        tl_text_md: topLevelFontSizeMd,
        tl_text_lg: topLevelFontSizeLg,
        tl_text_xl: topLevelFontSizeXl,
        setTopLevelWidth,
        setTopLevelFontSizeTailwind,
        setTopLevelFontSizeStyle: setTopLevelFontSizeMd,
        setTopLevelFontSizeLg,
        setTopLevelFontSizeXl,
      }}
    >
      {children}
    </TopLevelContext.Provider>
  );
};

export const useTopLevelStore = () => {
  const context = useContext(TopLevelContext);
  if (!context) {
    throw new Error('useTopLevelStore must be used within a TopLevelProvider');
  }
  return context;
};
