(function () {

    // Predict HDI
    function predictHDI(lifeExp, meanSchool, expectedSchool, gni) {

        const lifeMin = 20;
        const lifeMax = 85;

        const schoolMin = 0;
        const schoolMax = 20;

        const expectedMin = 0;
        const expectedMax = 22;

        const gniMin = 500;
        const gniMax = 75000;

        // Life Expectancy Index
        let lifeIndex = (lifeExp - lifeMin) / (lifeMax - lifeMin);
        lifeIndex = Math.min(1, Math.max(0, lifeIndex));

        // Education Index
        const meanIndex = (meanSchool - schoolMin) / (schoolMax - schoolMin);
        const expectedIndex = (expectedSchool - expectedMin) / (expectedMax - expectedMin);

        const eduIndex =
            Math.min(
                1,
                Math.max(
                    0,
                    Math.sqrt(meanIndex * expectedIndex) * 0.95 + 0.05
                )
            );

        // Income Index
        const gniLog = Math.log(gni) / Math.log(10);

        const gniMinLog = Math.log(gniMin) / Math.log(10);

        const gniMaxLog = Math.log(gniMax) / Math.log(10);

        let gniIndex =
            (gniLog - gniMinLog) /
            (gniMaxLog - gniMinLog);

        gniIndex = Math.min(1, Math.max(0, gniIndex));

        // HDI Score
        let hdi = Math.pow(
            lifeIndex * eduIndex * gniIndex,
            1 / 3
        );

        // Small deterministic variation
        const seed =
            (
                lifeExp * 0.7 +
                meanSchool * 1.2 +
                expectedSchool * 0.9 +
                gni * 0.001
            ) % 1;

        const jitter = (seed - 0.5) * 0.018;

        hdi = Math.min(
            0.99,
            Math.max(
                0.01,
                hdi + jitter
            )
        );

        return hdi;

    }

    // Tier
    function getTier(hdi) {

        if (hdi >= 0.800) {
            return {
                label: "Very High",
                className: "tier-very-high",
                color: "#1d5e3f"
            };
        }

        if (hdi >= 0.700) {
            return {
                label: "High",
                className: "tier-high",
                color: "#2b7a5a"
            };
        }

        if (hdi >= 0.550) {
            return {
                label: "Medium",
                className: "tier-medium",
                color: "#b68b3c"
            };
        }

        return {
            label: "Low",
            className: "tier-low",
            color: "#a13d3d"
        };

    }

    // Elements

    const form = document.getElementById("hdiForm");

    const resultContent =
        document.getElementById("resultContent");

    const resultLoader =
        document.getElementById("resultLoader");

    const predictBtn =
        document.getElementById("predictBtn");
            function showResult(hdi, countryName = "") {

        const tier = getTier(hdi);

        const percentage = (hdi * 100).toFixed(1);

        resultLoader.classList.add("d-none");
        resultContent.classList.remove("d-none");

        resultContent.innerHTML = `
            <div class="w-100">

                <div class="d-flex justify-content-between align-items-center">

                    <span class="fw-semibold">
                        HDI Score
                    </span>

                    <span class="badge ${tier.className} badge-tier">
                        ${tier.label}
                    </span>

                </div>

                <div
                    class="display-4 fw-bold mt-2"
                    style="color:${tier.color};">

                    ${hdi.toFixed(3)}

                </div>

                <div class="hdi-gauge mt-3">

                    <div
                        class="hdi-gauge-fill"
                        style="width:${percentage}%">
                    </div>

                </div>

                <div class="mt-3">

                    <strong>${countryName}</strong>

                </div>

                <p class="small-meta mt-2">

                    ${tier.label} Human Development

                </p>

            </div>
        `;
    }

    function resetResult() {

        resultLoader.classList.add("d-none");

        resultContent.classList.remove("d-none");

        resultContent.innerHTML = `

            <i class="bi bi-bar-chart-line"
               style="font-size:3rem;color:#6c757d;opacity:.3;">
            </i>

            <p class="mt-3">

                Submit indicators to
                <br>
                receive HDI prediction

            </p>

        `;
    }

    form.addEventListener("submit", function (e) {

        e.preventDefault();

        const lifeExp =
            parseFloat(document.getElementById("lifeExp").value);

        const meanSchool =
            parseFloat(document.getElementById("meanSchool").value);

        const expectedSchool =
            parseFloat(document.getElementById("expectedSchool").value);

        const gni =
            parseFloat(document.getElementById("gni").value);

        const country =
            document.getElementById("countryName").value;

        if (
            isNaN(lifeExp) ||
            isNaN(meanSchool) ||
            isNaN(expectedSchool) ||
            isNaN(gni)
        ) {

            alert("Please enter valid values.");

            return;
        }

        resultLoader.classList.remove("d-none");

        resultContent.classList.add("d-none");

        predictBtn.disabled = true;

        predictBtn.innerHTML =
            '<span class="spinner-border spinner-border-sm me-2"></span>Calculating...';

        setTimeout(function () {

            const hdi =
                predictHDI(
                    lifeExp,
                    meanSchool,
                    expectedSchool,
                    gni
                );

            showResult(hdi, country);

            predictBtn.disabled = false;

            predictBtn.innerHTML =
                '<i class="bi bi-calculator me-2"></i>Predict HDI';

        }, 400);

    });

    form.addEventListener("reset", function () {

        setTimeout(function () {

            document.getElementById("lifeExp").value = "72.5";
            document.getElementById("meanSchool").value = "10.2";
            document.getElementById("expectedSchool").value = "13.5";
            document.getElementById("gni").value = "18500";
            document.getElementById("countryName").value = "Sample";

            resetResult();

        }, 10);

    });

    resetResult();

})();