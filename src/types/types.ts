// src/types/types.ts
export interface AIContent {
  objective: string;
  tone: string;
  valueProp1: string;
  valueProp2: string;
  hook: string;
  description: string;
  cta: string;
  scene1Script: string;
  scene1Visual: string;
  scene1Sound: string;
  scene2Script: string;
  scene2Visual: string;
  scene2Sound: string;
  scene3Script: string;
  scene3Visual: string;
  scene3Sound: string;
  scene4Script: string;
  scene4Visual: string;
  scene4Sound: string;
  [key: string]: string;
}

export const emptyAIContent: AIContent = {
  objective: '',
  tone: '',
  valueProp1: '',
  valueProp2: '',
  hook: '',
  description: '',
  cta: '',
  scene1Script: '',
  scene1Visual: '',
  scene1Sound: '',
  scene2Script: '',
  scene2Visual: '',
  scene2Sound: '',
  scene3Script: '',
  scene3Visual: '',
  scene3Sound: '',
  scene4Script: '',
  scene4Visual: '',
  scene4Sound: '',
};