
import { Gender, ActivityLevel, Goal, UserProfile } from '../types';

export const calculateGoals = (
  gender: Gender,
  age: number,
  height: number,
  weight: number,
  activityLevel: ActivityLevel,
  goal: Goal
): Omit<UserProfile, 'dietType' | 'healthConditions'> => {
  // Si los datos son cero, no calcular nada para evitar bugs visuales
  if (age <= 0 || height <= 0 || weight <= 0) {
    return {
      gender, age, height, weight, activityLevel, goal,
      targetCalories: 0,
      targetProtein: 0,
      targetCarbs: 0,
      targetFat: 0
    };
  }

  // BMR calculation (Mifflin-St Jeor Equation)
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  if (gender === Gender.MALE) {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  const tdee = bmr * activityLevel;
  let targetCalories = tdee;

  if (goal === Goal.LOSE) {
    targetCalories -= 500;
  } else if (goal === Goal.GAIN) {
    targetCalories += 300;
  }

  // Asegurar un mínimo razonable solo si hay datos válidos
  targetCalories = Math.max(1200, Math.round(targetCalories));

  // Macros Calculation
  const pRatio = (goal === Goal.MAINTAIN) ? 1.8 : 2.0;
  const targetProtein = Math.round(weight * pRatio);
  const targetFat = Math.round((targetCalories * 0.25) / 9);

  const proteinCals = targetProtein * 4;
  const fatCals = targetFat * 9;
  const targetCarbs = Math.max(0, Math.round((targetCalories - proteinCals - fatCals) / 4));

  return {
    gender,
    age,
    height,
    weight,
    activityLevel,
    goal,
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFat
  };
};

export const getTodayKey = () => new Date().toISOString().split('T')[0];

export const getFormattedDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T12:00:00');
  return new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).format(date);
};
