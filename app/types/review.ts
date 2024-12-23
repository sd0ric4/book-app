export interface Character {
  name: string;
  role: string;
}

export interface BookReviewData {
  title: string;
  author: string;
  characters: Character[];
  synopsis: string;
}

export interface BookReviewProps {
  summary: BookReviewData;
  currentTheme: {
    text: string;
    button: string;
    activeButton: string;
    card: string;
    border: string;
    hover: string;
    subtext: string;
  };
}
