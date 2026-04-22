export const collectionOptionKeys = (kind: 'photo' | 'video') =>
  kind === 'photo'
    ? (['model', 'orientation'] as const)
    : (['duration', 'orientation', 'audio'] as const);

type OptionUi = {
  label: string;
  hint: string;
  placeholder: string;
};

const OPTION_UI: Record<string, OptionUi> = {
  model: {
    label: 'Модель (slug, по желанию)',
    hint: 'Служебное поле в JSON коллекции: slug модели для кастомных сценариев или интеграций. Текущий каталог эффектов его не подставляет автоматически — оставьте пустым, если не используете.',
    placeholder: 'nano-banana-2, nano-banana-pro, flux',
  },
  orientation: {
    label: 'Соотношение сторон',
    hint: 'Подсказка по формату кадра для сценариев, которые читают options.orientation (например 9:16 для вертикали).',
    placeholder: '9:16, 1:1, 16:9',
  },
  duration: {
    label: 'Длительность видео, сек',
    hint: 'Целое число секунд по умолчанию для роликов из этой коллекции, если клиент или пресет используют options.duration.',
    placeholder: '5',
  },
  audio: {
    label: 'Звук в ролике',
    hint: 'Текстовое значение для сценариев с options.audio: обычно true или false (или 1 / 0), если сборка это учитывает.',
    placeholder: 'true или false',
  },
};

export const getCollectionOptionFieldUi = (key: string): OptionUi => {
  const found = OPTION_UI[key];
  if (found) return found;
  return {
    label: `Доп. поле «${key}»`,
    hint: 'Произвольный ключ в options коллекции для расширений.',
    placeholder: '',
  };
};
