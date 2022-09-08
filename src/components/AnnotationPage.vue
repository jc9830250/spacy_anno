<template>
  <div>
    <classes-block />
    <div class="q-pa-lg" ref="anno_area">
      <component
        :is="t.type === 'token' ? 'Token' : 'TokenBlock'"
        :id="'t' + t.start"
        v-for="t in tm.tokens"
        :token="t"
        :key="t.start"
        :backgroundColor="t.backgroundColor"
        @remove-block="onRemoveBlock"
      />
    </div>

    <div class="q-pa-md" style="border-top: 1px solid #ccc">
      <q-btn
        color="blue"
        outline
        @click="PreviousTags"
        class="q-mx-md"
        label="Previous"
        v-if="currentIndex > 0"
      />
      <q-btn
        color="red"
        outline
        class="q-mx-md"
        @click="resetBlocks"
        label="Reset"
      />
      <q-btn
        class="q-mx-md"
        outline
        @click="skipCurrentSentence"
        label="Skip"
      />
      <q-btn
        class="q-mx-md"
        color="green"
        outline
        @click="saveTags"
        label="NEXT"
      />
      <q-btn
        color="purple"
        outline
        class="q-mx-md"
        @click="getNerAnno"
        label="Auto NER"
      />
    </div>
  </div>
</template>
<script>
import { mapState, mapMutations,mapGetters } from "vuex";
import Token from "./Token";
import TokenBlock from "./TokenBlock";
import ClassesBlock from "./ClassesBlock.vue";
import TokenManager from "./token-manager";
import TreebankTokenizer from "treebank-tokenizer";
import axios from 'axios';
export default {
  name: "AnnotationPage",
  data: function() {
    return {
      tm: new TokenManager([]),
      currentSentence: {},
      redone: "",
      tokenizer: new TreebankTokenizer(),
    };
  },
  components: {
    Token,
    TokenBlock,
    ClassesBlock,
  },
  computed: {
    ...mapState([
      "inputSentences",
      "classes",
      "annotations",
      "currentClass",
      "currentIndex",
    ]),
  },
  watch: {
    inputSentences() {
      this.resetIndex();
      this.tokenizeCurrentSentence();
    },
  },
  created() {
    if (this.inputSentences.length) {
      this.tokenizeCurrentSentence();
    }
    document.addEventListener("mouseup", this.selectTokens);
  },
  beforeUnmount() {
    document.removeEventListener("mouseup", this.selectTokens);
  },
  methods: {
    ...mapMutations(["nextSentence", "resetIndex","prevSentence"]),
    ...mapGetters(["checkCurrentAnnotationHTML", "getCurrentAnnotationHTML","geTokenclass"]),
    tokenizeCurrentSentence() {
      if (this.currentIndex >= this.inputSentences.length) {
        // TODO show completed message
        alert("You have completed all the sentences");
        return;
      }
      this.currentSentence = this.inputSentences[this.currentIndex];

      let tokens = this.tokenizer.tokenize(this.currentSentence.text);
      //console.log('123');
      console.log(this.currentSentence.text);
      let spans = this.tokenizer.span_tokenize(this.currentSentence.text);
      // console.log('123');
      console.log(spans);
      let combined = tokens.map((t, i) => [spans[i][0], spans[i][1], t]);
      //console.log('123');
      console.log(combined);
      this.tm = new TokenManager(combined);
      console.log(this.tm);
    },
    selectTokens() {
      let selection = document.getSelection();

      if (
        selection.anchorOffset === selection.focusOffset &&
        selection.anchorNode === selection.focusNode
      )
        return;
      let startIdx, endIdx;
      try {
        startIdx = parseInt(
          selection.anchorNode.parentElement.id.replace("t", "")
        );
        endIdx = parseInt(
          selection.focusNode.parentElement.id.replace("t", "")
        );
      } catch (e) {
        console.log("selected text were not tokens");
        return;
      }

      if (!this.classes.length && selection.anchorNode) {
        alert(
          "There are no Tags available. Kindly add some Tags before tagging."
        );
        selection.empty();
        return;
      }

      this.tm.addNewBlock(startIdx, endIdx, this.currentClass);
      console.log(this.tm);
      selection.empty();
    },
    onRemoveBlock(blockStart) {
      this.tm.removeBlock(blockStart);
    },
    resetBlocks() {
      this.tm.resetBlocks();
    },
    skipCurrentSentence() {
      this.nextSentence();
      this.tokenizeCurrentSentence();
      this.check_Anno();
    },
    check_Anno(){
      this._check =this.$store.getters.checkCurrentAnnotationHTML(this.currentIndex);
      if(this._check){
        this.tm = this._check;
      }
    },
    saveTags() {
     this.$store.commit("saveCurrentAnnotationHTML",this.tm);
      this.$store.commit("addAnnotation", [
        this.currentSentence.text,
        { entities: this.tm.exportAsAnnotation() },
      ]);
      this.nextSentence();
      this.tokenizeCurrentSentence();
      this.check_Anno();
      // this._check =this.$store.getters.checkCurrentAnnotationHTML(this.currentIndex);
      // if(this._check){
      //   this.tm = this._check;
      // }
    },
     PreviousTags() {
      console.log('prev');
      console.log(this.$refs.anno_area.innerHTML);
      console.log(this.currentSentence);
     // saveCurrentAnnotationHTML
      this.$store.commit("saveCurrentAnnotationHTML",this.tm);
      this.$store.commit("addAnnotation", [
        this.currentSentence.text,
        { entities: this.tm.exportAsAnnotation() },
      ]);
      this.prevSentence();
      this.tokenizeCurrentSentence();
      this.check_Anno();
      // this._check =this.$store.getters.checkCurrentAnnotationHTML(this.currentIndex);
      // if(this._check){
      //   this.tm = this._check;
      // }
      //console.log(this._check);
      // // if(this._check){

      // //  }
      //this.$refs.anno_area.innerHTML = '123';
    },
    getNerAnno() {
      // this.tagclass =this.$store.getters.getTokenclass("PERSONS");
      // this.tm.addNewBlock(21, 29, this.tagclass);
      console.log('1234');
      this.send_data = {
        sentence:this.currentSentence.text
      };
      this.send_headers={'Content-Type': 'application/json'};
      axios.post(this.getner,this.send_data,{
        headers: this.send_headers
      })
    .then( (response) => {
      console.log(response);
      this.ner_result= response.data.extractions;
            for (var i = 0; i <  this.ner_result.length; i++) {
         this.tagclass =this.$store.getters.getTokenclass(this.ner_result[i].name);
        this.tm.addNewBlock(this.ner_result[i].first_index, this.ner_result[i].last_index, this.tagclass);
      }
    })
    .catch( (error) => console.log(error))
    },
  },
  

};
</script>
