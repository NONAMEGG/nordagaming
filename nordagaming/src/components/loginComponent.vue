<template>
    <v-dialog v-model="internalDialog" persistent max-width="500">
        <v-card>
            <v-card-title class="text-h5">Login</v-card-title>
            <v-card-text>
                <v-form ref="form" v-model="valid">
                    <v-text-field
                        v-model="identifier"
                        label="Email or Username"
                        :rules="[rules.required, rules.emailOrUsername]"
                        required
                    ></v-text-field>
                    <v-text-field
                        v-model="password"
                        label="Password"
                        type="password"
                        :rules="[rules.required]"
                        required
                    ></v-text-field>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="closeDialog">Cancel</v-btn>
                <v-btn :disabled="!valid" color="primary" @click="submit">Login</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: {
        modelValue: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            internalDialog: this.modelValue,
            identifier: '',
            password: '',
            valid: false,
            rules: {
                required: (value) => !!value || 'Required.',
                emailOrUsername: (value) => {
                    if (!value) return true;
                    const email = /.+@.+\..+/.test(value);
                    const username = /^[a-zA-Z0-9_]{3,}$/.test(value);
                    return email || username || 'Enter a valid email or username (min 3 chars).';
                },
            },
        };
    },
    watch: {
        modelValue(val) {
            this.internalDialog = val;
        },
        internalDialog(val) {
            this.$emit('update:modelValue', val);
        }
    },
    methods: {
        closeDialog() {
            this.internalDialog = false;
        },
        submit() {
            if (this.$refs.form.validate()) {
                console.log('Identifier:', this.identifier);
                console.log('Password:', this.password);
            }
        },
    },
};
</script>

<style scoped>
/* Add any custom styles here */
</style>
