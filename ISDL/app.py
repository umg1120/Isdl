from flask import Flask,  request, jsonify, render_template
from transformers import MarianMTModel, MarianTokenizer

app=Flask(__name__) 

# Load the model and tokenizer
model_name = "Helsinki-NLP/opus-mt-en-hi"
tokenizer = MarianTokenizer.from_pretrained(model_name)
model = MarianMTModel.from_pretrained(model_name)


@app.route("/")
def home():
    return render_template('index.html')

@app.route("/translate", methods=['POST'])
def translate():
    input_text = request.form.get('input_text')
    input_language = request.form.get('input_language')
    output_language = request.form.get('output_language')
    # Print to verify data received
    print(f"Input Text: {input_text}")
    print(f"Input Language: {input_language}")
    print(f"Output Language: {output_language}")

    tokenized_text = tokenizer.prepare_seq2seq_batch([input_text], return_tensors='pt', src_lang=input_language, tgt_lang=output_language)
    translation_tokens = model.generate(**tokenized_text)
    translation = tokenizer.decode(translation_tokens[0], skip_special_tokens=True)
    
    # Your logic to translate the text
    #translated_text = f"Translated '{input_text}' from {input_language} to {output_language}"
    
    # Respond with JSON
    return jsonify({"translated_text": translation})

if __name__=="__main__":
    app.run(debug=True)