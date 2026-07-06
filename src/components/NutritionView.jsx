import { useState } from 'react';
import { toISODate } from '../utils/dates.js';
import { estimateMealFromPhoto } from '../utils/aiVision.js';
import { loadApiKey } from '../utils/storage.js';

const MEAL_TYPE_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

function NutritionView({ config, mealsCatalog, meals, actions }) {
  const [segment, setSegment] = useState('log');
  const todayISO = toISODate(new Date());
  const todayMeals = meals.filter((meal) => meal.date === todayISO);
  const totalCalories = todayMeals.reduce((sum, meal) => sum + Number(meal.calories || 0), 0);
  const totalProtein = todayMeals.reduce((sum, meal) => sum + Number(meal.protein_g || 0), 0);

  const [manualName, setManualName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [estimating, setEstimating] = useState(false);
  const [estimateError, setEstimateError] = useState('');
  const [estimate, setEstimate] = useState(null);

  function resetPhotoFlow() {
    setPhotoFile(null);
    setPhotoPreview('');
    setEstimate(null);
    setEstimateError('');
  }

  function handleAddSuggestion(suggestion) {
    actions.addMeal({
      date: todayISO,
      name: suggestion.name,
      calories: suggestion.calories,
      protein_g: suggestion.protein_g,
      source: 'suggestion',
    });
  }

  function handleManualAdd() {
    if (!manualName.trim() || !manualCalories) {
      return;
    }
    actions.addMeal({
      date: todayISO,
      name: manualName.trim(),
      calories: Number(manualCalories),
      protein_g: manualProtein ? Number(manualProtein) : 0,
      source: 'manual',
    });
    setManualName('');
    setManualCalories('');
    setManualProtein('');
  }

  function handlePhotoSelected(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setEstimate(null);
    setEstimateError('');
  }

  async function handleEstimate() {
    const apiKey = loadApiKey();
    if (!apiKey) {
      setEstimateError('Add your Anthropic API key in Settings first.');
      return;
    }
    setEstimating(true);
    setEstimateError('');
    try {
      const result = await estimateMealFromPhoto(photoFile, apiKey);
      setEstimate(result);
    } catch (err) {
      setEstimateError(err.message || 'Estimate failed.');
    } finally {
      setEstimating(false);
    }
  }

  function handleConfirmEstimate() {
    if (!estimate) {
      return;
    }
    actions.addMeal({
      date: todayISO,
      name: estimate.name,
      calories: Number(estimate.calories) || 0,
      protein_g: Number(estimate.protein_g) || 0,
      source: 'photo',
      evidence: estimate.evidence || '',
    });
    resetPhotoFlow();
  }

  function updateEstimateField(field, value) {
    setEstimate((prev) => ({ ...prev, [field]: value }));
  }

  let segmentContent = null;

  if (segment === 'suggestions') {
    segmentContent = MEAL_TYPES.map((type) => {
      const items = mealsCatalog.filter((meal) => meal.type === type);
      return (
        <section className="card" key={type}>
          <h3 className="card-title">{MEAL_TYPE_LABELS[type]}</h3>
          <ul className="suggestion-list">
            {items.map((meal) => {
              let ingredientsBlock = null;
              if (meal.ingredients && meal.ingredients.length > 0) {
                ingredientsBlock = (
                  <div>
                    <h4 className="recipe-subhead">Ingredients</h4>
                    <ul className="recipe-ingredient-list">
                      {meal.ingredients.map((ingredient) => (
                        <li key={ingredient}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                );
              }

              let instructionsBlock = null;
              if (meal.instructions && meal.instructions.length > 0) {
                instructionsBlock = (
                  <div>
                    <h4 className="recipe-subhead">Method</h4>
                    <ol className="recipe-instruction-list">
                      {meal.instructions.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </div>
                );
              }

              return (
                <li key={meal.name}>
                  <details className="recipe-card">
                    <summary className="suggestion-row">
                      <div className="suggestion-info">
                        <span className="suggestion-name">{meal.name}</span>
                        <span className="suggestion-macros">
                          {meal.calories} kcal · {meal.protein_g}g protein
                        </span>
                      </div>
                    </summary>
                    <div className="recipe-panel">
                      <div className="recipe-macros">
                        <span>Protein {meal.protein_g}g</span>
                        <span>Carbs {meal.carbs_g}g</span>
                        <span>Fat {meal.fat_g}g</span>
                      </div>
                      <p className="recipe-meta">
                        {meal.prep_minutes} min · Serves {meal.servings}
                      </p>
                      {ingredientsBlock}
                      {instructionsBlock}
                      <button
                        type="button"
                        className="btn btn-small btn-primary"
                        onClick={() => handleAddSuggestion(meal)}
                      >
                        Add to Today's Log
                      </button>
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        </section>
      );
    });
  } else {
    let estimateErrorBlock = null;
    if (estimateError) {
      estimateErrorBlock = <p className="form-error">{estimateError}</p>;
    }

    let estimateResultBlock = null;
    if (estimate) {
      let evidenceBlock = null;
      if (estimate.evidence) {
        evidenceBlock = <p className="estimate-evidence">{estimate.evidence}</p>;
      }
      estimateResultBlock = (
        <div className="estimate-result">
          <input
            className="text-input"
            value={estimate.name || ''}
            onChange={(event) => updateEstimateField('name', event.target.value)}
          />
          <div className="estimate-fields">
            <input
              className="text-input"
              type="number"
              value={estimate.calories ?? ''}
              onChange={(event) => updateEstimateField('calories', event.target.value)}
            />
            <input
              className="text-input"
              type="number"
              value={estimate.protein_g ?? ''}
              onChange={(event) => updateEstimateField('protein_g', event.target.value)}
            />
          </div>
          {evidenceBlock}
          <button type="button" className="btn btn-primary" onClick={handleConfirmEstimate}>
            Add to log
          </button>
        </div>
      );
    }

    let photoPreviewBlock = null;
    if (photoPreview) {
      photoPreviewBlock = <img className="photo-preview" src={photoPreview} alt="Selected meal" />;
    }

    let estimateButtonBlock = null;
    if (photoFile && !estimate) {
      let estimateButtonLabel = 'Estimate calories';
      if (estimating) {
        estimateButtonLabel = 'Estimating…';
      }
      estimateButtonBlock = (
        <button type="button" className="btn btn-primary" onClick={handleEstimate} disabled={estimating}>
          {estimateButtonLabel}
        </button>
      );
    }

    const calorieProgress = Math.min((totalCalories / config.nutrition.calories) * 100, 100);

    segmentContent = [
      <section className="card" key="progress">
        <h3 className="card-title">Today's Calories</h3>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${calorieProgress}%` }} />
        </div>
        <p className="nutrition-notes">
          {totalCalories} / {config.nutrition.calories} kcal · {totalProtein}g protein
        </p>
      </section>,

      <section className="card" key="manual">
        <h3 className="card-title">Add a Meal</h3>
        <input
          className="text-input"
          placeholder="Meal name"
          value={manualName}
          onChange={(event) => setManualName(event.target.value)}
        />
        <div className="estimate-fields">
          <input
            className="text-input"
            type="number"
            placeholder="Calories"
            value={manualCalories}
            onChange={(event) => setManualCalories(event.target.value)}
          />
          <input
            className="text-input"
            type="number"
            placeholder="Protein (g)"
            value={manualProtein}
            onChange={(event) => setManualProtein(event.target.value)}
          />
        </div>
        <button type="button" className="btn btn-primary" onClick={handleManualAdd}>
          Add Meal
        </button>
      </section>,

      <section className="card" key="photo">
        <h3 className="card-title">Or Snap a Photo</h3>
        <label className="btn btn-outline photo-input-label">
          Take / Choose Photo
          <input
            className="photo-input"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoSelected}
          />
        </label>
        {photoPreviewBlock}
        {estimateButtonBlock}
        {estimateErrorBlock}
        {estimateResultBlock}
      </section>,

      <section className="card" key="logged">
        <h3 className="card-title">Logged Today</h3>
        <ul className="meal-log-list">
          {todayMeals.map((meal, index) => (
            <li className="meal-log-row" key={`${meal.name}-${index}`}>
              <div className="suggestion-info">
                <span className="suggestion-name">{meal.name}</span>
                <span className="suggestion-macros">
                  {meal.calories} kcal · {meal.protein_g}g protein
                </span>
              </div>
              <button
                type="button"
                className="btn btn-text"
                onClick={() => actions.removeMeal(todayISO, index)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>,
    ];
  }

  return (
    <div className="view">
      <div className="segmented-control">
        <button
          type="button"
          className={segment === 'log' ? 'segment segment-active' : 'segment'}
          onClick={() => setSegment('log')}
        >
          Log
        </button>
        <button
          type="button"
          className={segment === 'suggestions' ? 'segment segment-active' : 'segment'}
          onClick={() => setSegment('suggestions')}
        >
          Recipes
        </button>
      </div>
      {segmentContent}
    </div>
  );
}

export default NutritionView;
